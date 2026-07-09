const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utlls/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');



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
// Show Route
router.get("/:id", wrapAsync(async(req, res) => {
    // FIX: Chain populate("owner") along with your nested reviews population
    const listing = await Listing.findById(req.params.id)
        .populate({ 
            path: "reviews", 
            populate: { path: "author" } 
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");   
    }
    console.log(listing);
    res.render("listings/show", { data: listing });
}));

//Create Route
router.post("/", isLoggedIn,isOwner, validateListing,
     wrapAsync(async(req, res, next) => {
   
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "Successfully created a new listing!");
        res.redirect("/listings");
     }));
    

// Edit Route (Removed validateListing)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id);
     if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing: listing });
}));



//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async(req, res) => {
    
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
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async(req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
     req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;            