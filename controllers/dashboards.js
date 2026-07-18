const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.renderDashboard = async (req, res) => {
    const userId = req.user._id;

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