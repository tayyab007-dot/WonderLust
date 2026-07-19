const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utlls/wrapAsync.js");

// Route to initialize a new checkout pipeline session
router.post("/checkout-session/:bookingId", isLoggedIn, wrapAsync(async (req, res) => {
    const { bookingId } = req.params;
    
    // Fetch the target record securely
    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking record not found.");
        return res.redirect("/dashboard");
    }

    // Initialize Stripe session options blueprint data
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: booking.listing.title,
                    description: `Stay window from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()}`,
                },
                unit_amount: booking.totalPrice * 100, // Stripe handles currency amounts in minor units (cents)
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.STRIPE_SUCCESS_URL}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.STRIPE_CANCEL_URL,
        metadata: {
            bookingId: booking._id.toString()
        }
    });

    // Pass the external payment gateway landing address straight back to frontend redirects
    res.redirect(303, session.url);
}));

module.exports = router;