const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const { sendReceiptEmail, sendHostAlertEmail } = require("../utlls/email.js"); 

module.exports.renderDashboard = async (req, res) => {
    const userId = req.user._id;
    const { payment, session_id } = req.query;

    // 1. INTERCEPT AND SECURE STRIPE REDIRECTION TOKEN SIGNALS
    if (payment === "success" && session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            
            if (session.payment_status === "paid") {
                const bookingId = session.metadata.bookingId;
                const existingBooking = await Booking.findById(bookingId);
                
                // CRITICAL FIX: Verify booking exists, belongs to logged-in user, and isn't already paid
                if (existingBooking && existingBooking.guest.equals(userId) && existingBooking.status !== "Paid") {
                    
                    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: "Paid" })
                        .populate({
                            path: "listing",
                            populate: {
                                path: "owner"
                            }
                        });
                    
                    if (updatedBooking) {
                        // Dispatch guest receipt email safely
                        await sendReceiptEmail(req.user.email, updatedBooking);
                        
                        // Dispatch host alert notification email safely
                        if (updatedBooking.listing?.owner?.email) {
                            await sendHostAlertEmail(updatedBooking.listing.owner.email, updatedBooking);
                        }
                    }
                    
                    req.flash("success", "Payment successful! Your reservation is fully locked in.");
                }
            }
            
            // CRITICAL FIX: Redirect cleanly to clear query parameters from browser URL bar
            return res.redirect("/dashboard");
            
        } catch (err) {
            console.error("Stripe Verification Error: ", err);
            req.flash("error", "An error occurred verifying your payment tracking signatures.");
            return res.redirect("/dashboard");
        }
    }

    // 2. Guest Data: Find bookings made by the current user
    const myTrips = await Booking.find({ guest: userId })
        .populate("listing")
        .sort({ startDate: 1 });

    // 3. Host Data: Find all properties owned by the current user
    const myProperties = await Listing.find({ owner: userId });
    const propertyIds = myProperties.map(p => p._id);

    // 4. Host Metrics: Find all bookings matching those properties
    const incomingReservations = await Booking.find({ listing: { $in: propertyIds } })
        .populate("listing")
        .populate("guest")
        .sort({ startDate: 1 });

    // 5. Financial Analytics Calculation
    let totalEarnings = 0;
    let monthlyRevenueArray = new Array(12).fill(0);

    incomingReservations.forEach(booking => {
        if (booking.status === "Paid" || booking.status === "Pending") {
            totalEarnings += booking.totalPrice;
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