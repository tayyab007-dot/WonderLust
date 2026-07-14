const Listing = require("../models/listing.js");

// Index Route Logic
module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { data: listings });
};

// Render New Form Logic
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show Listing Logic
module.exports.showListing = async (req, res) => {
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
    res.render("listings/show.ejs", { data: listing });
};

// Create Listing Logic
// Add node-fetch or use native global fetch (supported automatically in Node.js v18+)
// If you are on Node.js v18+, global fetch works out of the box!

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: url, filename: filename };

    // ─── GEOCONVERSION LOGIC (FREE & NO-KEYS) ───
    const queryAddress = `${req.body.listing.location}, ${req.body.listing.country}`;
    
    try {
        // We fetch coordinates from OpenStreetMap's Nominatim API
        // User-Agent header is required by Nominatim's free-use policy
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryAddress)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'WanderLustApp_StudentProject'
                }
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            // GeoJSON coordinates are stored as [longitude, latitude]
            const lon = parseFloat(data[0].lon);
            const lat = parseFloat(data[0].lat);
            
            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };
        } else {
            // Fallback to coordinates [0, 0] or default city center if address isn't found
            newListing.geometry = {
                type: "Point",
                coordinates: [0, 0] // Default fallback center
            };
        }
    } catch (err) {
        console.error("Geocoding Error: ", err);
        // Ensure app doesn't crash on network failure, set a fallback
        newListing.geometry = {
            type: "Point",
            coordinates: [0, 0]
        };
    }

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};


// Render Edit Form Logic
module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    
    // Create an optimized thumbnail preview URL
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update Listing Logic
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    
    // 1. Update text-based details first
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    // 2. Check if the user uploaded a new file
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};



// Destroy Listing Logic
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};