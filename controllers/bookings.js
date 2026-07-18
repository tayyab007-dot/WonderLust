// controllers/bookings.js
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.createReservation = async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.body.booking;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The property listing no longer exists!");
        return res.redirect("/listings");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
        req.flash("error", "Checkout date must be after check-in date!");
        return res.redirect(`/listings/${id}`); // Safely redirects back to show route
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const calculatedTotalPrice = totalDays * listing.price;

    const newBooking = new Booking({
        listing: listing._id,
        guest: req.user._id,
        startDate: start,
        endDate: end,
        totalPrice: calculatedTotalPrice,
        status: "Pending"
    });

    await newBooking.save();
    
    req.flash("success", `Reservation initialized! Total days: ${totalDays}. Proceeding to checkout.`);
    res.redirect(`/listings/${id}`);
};