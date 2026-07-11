const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utlls/ExpressError.js');
const wrapAsync = require('../utlls/wrapAsync.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

// Route
//POST Reviews route
// Change this line from router.post("/reviews", ...) to:
// POST Reviews route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//DELETE Review route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;