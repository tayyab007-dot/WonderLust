const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
// 1. Destructure both export handlers from the email utility module
const { sendReceiptEmail, sendHostAlertEmail } = require("../utlls/email.js"); 

module.exports.renderDashboard = async (req, res) => {
    const userId = req.user._id;
    const { payment, session_id } = req.query;

    // INTERCEPT STRIPE REDIRECTION TOKEN SIGNALS
    if (payment === "success" && session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status === "paid") {
                const bookingId = session.metadata.bookingId;
                
                // 2. FIXED: Nested populate pulls the property AND the owner data together
                const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: "Paid" })
                    .populate({
                        path: "listing",
                        populate: {
                            path: "owner" // This pulls the host's full model document record
                        }
                    });
                
                if (updatedBooking) {
                    // 3. Dispatch the Guest Receipt Email
                    await sendReceiptEmail(req.user.email, updatedBooking);
                    
                    // 4. Dispatch the Host Alert Notification Email if the owner has an email address
                    if (updatedBooking.listing && updatedBooking.listing.owner && updatedBooking.listing.owner.email) {
                        const hostEmail = updatedBooking.listing.owner.email;
                        await sendHostAlertEmail(hostEmail, updatedBooking);
                    }
                }
                
                req.flash("success", "Payment successful! Your reservation is fully locked in.");
            }
        } catch (err) {
            console.error("Stripe Verification Error: ", err);
        }
    }

    // ... The rest of your dashboard data arrays populations stay exactly the same ...

    // 1. Guest Data: Find bookings made by the current user
    const myTrips = await Booking.find({ guest: userId })
        .populate("listing")
        .sort({ startDate: 1 });

    // 2. Host Data: Find all properties owned by the current user
    const myProperties = await Listing.find({ owner: userId });
    const propertyIds = myProperties.map(p => p._id);

    // 3. Host Metrics: Find all bookings matching those properties
    const incomingReservations = await Booking.find({ listing: { $in: propertyIds } })
        .populate("listing")
        .populate("guest")
        .sort({ startDate: 1 });

    // 4. Financial Analytics Calculation
    let totalEarnings = 0;
    let monthlyRevenueArray = new Array(12).fill(0); // [Jan, Feb, ... Dec]

    incomingReservations.forEach(booking => {
        if (booking.status === "Paid" || booking.status === "Pending") {
            totalEarnings += booking.totalPrice;
            
            // Map revenue to corresponding calendar month index for Chart.js
            const monthIndex = new Date(booking.startDate).getMonth();
            monthlyRevenueArray[monthIndex] += booking.totalPrice;
        }
    });

    res.render("users/dashboard.ejs", {
        myTrips,
        myProperties,
        incomingReservations,
        analytics: {
            totalEarnings,
            totalBookings: incomingReservations.length,
            chartData: JSON.stringify(monthlyRevenueArray)
        }
    });
};