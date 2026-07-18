// controllers/listings.js
const Listing = require("../models/listing.js");

// Optimized Dynamic Index Route Logic (Search, Filter, Sort)
module.exports.index = async (req, res) => {
    let { category, search, sort } = req.query;
    let queryObj = {};

    // 1. Category Filtering
    if (category) {
        queryObj.category = category;
    }

    // 2. Fuzzy Text Search across Title, Location, and Country fields
    if (search) {
        queryObj.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    // 3. Execution of Query with Sorting Logic
    let apiQuery = Listing.find(queryObj);

    if (sort === "price_asc") {
        apiQuery = apiQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
        apiQuery = apiQuery.sort({ price: -1 });
    }

    const listings = await apiQuery;
    
    // Pass the active filters back to the template to keep track of active states if needed
    res.render("listings/index.ejs", { data: listings, activeCategory: category || "" });
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

// Create Listing Logic with Category parsing
// 1. Updated Create Listing Logic
module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // CHANGED: Map through the array of uploaded files from Multer
    if (req.files && req.files.length > 0) {
        newListing.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    }

    if (!req.body.listing.category) {
        newListing.category = "Trending";
    }

    const queryAddress = `${req.body.listing.location}, ${req.body.listing.country}`;
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryAddress)}&limit=1`,
            { headers: { 'User-Agent': 'WanderLustApp_StudentProject' } }
        );
        const data = await response.json();
        if (data && data.length > 0) {
            const lon = parseFloat(data[0].lon);
            const lat = parseFloat(data[0].lat);
            newListing.geometry = { type: "Point", coordinates: [lon, lat] };
        } else {
            newListing.geometry = { type: "Point", coordinates: [0, 0] };
        }
    } catch (err) {
        console.error("Geocoding Error: ", err);
        newListing.geometry = { type: "Point", coordinates: [0, 0] };
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
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update Listing Logic
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    // CHANGED: If new files are uploaded, map them and push them into the array
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.image.push(...newImages); // Appends new images to existing gallery
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Destroy Listing Logic
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};