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

    // 1. HOST PREVENTION CONSTRAINT
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "Security Exception: You cannot book reservations on your own property listing.");
        return res.redirect(`/listings/${id}`);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 2. DEFENSIVE DATA TYPE VALIDATION (Anti-NaN Guard Clause)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        req.flash("error", "The provided reservation dates are malformed or invalid.");
        return res.redirect(`/listings/${id}`);
    }

    // 3. RETROACTIVE TIME PROTECTION GUARD
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for clean day comparisons
    if (start < today) {
        req.flash("error", "Reservation Error: Check-in dates cannot be historical dates from the past.");
        return res.redirect(`/listings/${id}`);
    }

    // 4. CHRONOLOGICAL LOGIC ENFORCEMENT
    if (end <= start) {
        req.flash("error", "Reservation Error: Checkout date must be after check-in date!");
        return res.redirect(`/listings/${id}`);
    }

    // 5. MAX DURATION CAPACITY SANITY CEILING
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (totalDays > 90) {
        req.flash("error", "Platform Policy: Stays are limited to a maximum duration of 90 days per reservation.");
        return res.redirect(`/listings/${id}`);
    }

    // 6. CRITICAL FIX: OVERLAPPING CONCURRENCY DATE-RANGE CHECK (Prevents Double-Booking)
    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: { $in: ["Pending", "Paid"] }, // Ignores completely benign Cancelled transaction logs
        startDate: { $lt: end },
        endDate: { $gt: start }
    });

    if (overlappingBooking) {
        req.flash("error", "Scheduling Conflict: Those dates are no longer available for this listing.");
        return res.redirect(`/listings/${id}`);
    }

    // 7. SECURE SERVER-SIDE PRICING COMPILATION
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