const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utlls/wrapAsync.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const ExpressError = require('../utlls/ExpressError.js');
const { isLoggedIn } = require('../middleware.js');

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};



//Index Route
router.get("/", wrapAsync(async(req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { data: listings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

//Show Route
router.get("/:id", wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id ).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { data: listing });
}));

//Create Route
router.post("/", isLoggedIn, validateListing,
     wrapAsync(async(req, res, next) => {
   
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "Successfully created a new listing!");
        res.redirect("/listings");
     }));
    

// Edit Route (Removed validateListing)
router.get("/:id/edit", isLoggedIn, wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id);
     if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing: listing });
}));



//Update Route
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async(req, res) => {
    
    const listing = await Listing.findById(req.params.id);
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    await listing.save();
     req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route (Removed validateListing)
router.delete("/:id", isLoggedIn, wrapAsync(async(req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
     req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;            