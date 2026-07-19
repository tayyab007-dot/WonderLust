const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require('./utlls/ExpressError.js'); // Keeping your specific "utlls" path configuration
const { listingSchema, reviewSchema } = require('./schema.js');

// 1. Authenticated Session Check
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};

// 2. Post-Login Redirection Tracker
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// 3. Property Administrative Rights Authorization Check
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "The requested listing asset record was not found.");
        return res.redirect("/listings");
    }
    
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have administrative owner authorization permissions over this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// 4. Review Deletion Rights Authorization Check
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
        req.flash("error", "The requested review record was not found.");
        return res.redirect(`/listings/${id}`);
    }
    
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have master permissions to manipulate this review log.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// 5. FIXED: Added Joi Request Payload Validator for Listings
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 6. FIXED: Added Joi Request Payload Validator for Reviews
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};