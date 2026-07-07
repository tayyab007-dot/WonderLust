const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utlls/wrapAsync.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const ExpressError = require('../utlls/ExpressError.js');

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
router.get("/new", (req, res) => {
    res.render("listings/new");
});

//Show Route
router.get("/:id", wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id ).populate("reviews");
    res.render("listings/show", { data: listing });
}));

//Create Route
router.post("/", validateListing,
     wrapAsync(async(req, res, next) => {
   
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
     }));
    

// Edit Route (Removed validateListing)
router.get("/:id/edit", wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing: listing });
}));



//Update Route
router.put("/:id", validateListing, wrapAsync(async(req, res) => {
    
    const listing = await Listing.findById(req.params.id);
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route (Removed validateListing)
router.delete("/:id", wrapAsync(async(req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
}));

module.exports = router;            