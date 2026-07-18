const express = require("express");
const router = express.Router();
const wrapAsync = require("../utlls/wrapAsync.js"); // Fixed typo from your snippet
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require('../cloudConfig.js');

// Configured upload to accept an array of up to 5 images
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.array('listing[image]', 5), // Changed to handle image arrays
        validateListing,
        wrapAsync(listingController.createListing)
    );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, and Delete Routes
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.array('listing[image]', 5), // Changed to handle image arrays on edit
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;