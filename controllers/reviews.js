const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req, res) => {
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
}

module.exports.destroyReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}