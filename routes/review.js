const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utlls/ExpressError.js');
const wrapAsync = require('../utlls/wrapAsync.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

// Route
//POST Reviews route
// Change this line from router.post("/reviews", ...) to:
// POST Reviews route
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    // 1. Create the review once
    let newReview = new Review(req.body.review);
    
    // 2. Assign the author (Make sure this matches the spelling inside models/review.js!)
    newReview.author = req.user._id; 
    
    // 3. Link to listing, save database entries, and redirect
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();

    console.log("new review added");
    req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
}));



//DELETE Review route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;