const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const Review = require('../models/review');
const wrapAsync = require('../utlls/wrapAsync.js');
const { reviewSchema } = require('../schema.js');
const ExpressError = require('../utlls/ExpressError.js');



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


// Route
//POST Reviews route
// Change this line from router.post("/reviews", ...) to:
router.post("/", validateReview, wrapAsync(async(req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review added");
     req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
}));



//DELETE Review route
router.delete("/:reviewId", wrapAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;