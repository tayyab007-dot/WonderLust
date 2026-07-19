const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utlls/wrapAsync.js");

router.post("/checkout-session/:bookingId", isLoggedIn, wrapAsync(async (req, res) => {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).populate("listing");
    
    // CRITICAL FIX A: Ensure record exists
    if (!booking) {
        req.flash("error", "Booking record not found.");
        return res.redirect("/dashboard");
    }
    
    // CRITICAL FIX B: Ensure the logged-in user actually owns this booking resource
    if (!booking.guest.equals(req.user._id)) {
        req.flash("error", "Access Denied: You do not have permission to initialize payment for this trip profile.");
        return res.redirect("/dashboard");
    }
    
    // CRITICAL FIX C: Prevent initializing secondary checkouts on completed transactions
    if (booking.status === "Paid") {
        req.flash("error", "This booking transaction has already been completed successfully.");
        return res.redirect("/dashboard");
    }

    // SAFEST DYNAMIC APPROACH: Evaluate string pattern parameters safely for query character configurations
    const baseUrl = process.env.STRIPE_SUCCESS_URL;
    const separator = baseUrl.includes('?') ? '&' : '?';
    const finalSuccessUrl = `${baseUrl}${separator}session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: booking.listing.title,
                        description: `Stay from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`,
                    },
                    unit_amount: booking.totalPrice * 100, // Normalized unit conversion
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: finalSuccessUrl,
        cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:8080/dashboard",
        metadata: {
            bookingId: booking._id.toString(),
        },
    });

    res.redirect(303, session.url);
}));

module.exports = router;