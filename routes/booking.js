const express = require("express");
const router = express.Router({ mergeParams: true }); // Crucial to access parent listing ID parameters
const wrapAsync = require("../utlls/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// POST route matching path structure: /listings/:id/bookings
router.post("/", isLoggedIn, wrapAsync(bookingController.createReservation));

module.exports = router;