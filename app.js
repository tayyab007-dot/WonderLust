const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utlls/wrapAsync.js");
const ExpressError = require("./utlls/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => 
    console.log("Connected to MongoDB"))
.catch((err) => 
    console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(__dirname + "/public"));


app.get("/", (req, res)=>{
    res.send("Root is working");
});

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index Route
app.get("/listings", wrapAsync(async(req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { data: listings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

//Show Route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id ).populate("reviews");
    res.render("listings/show", { data: listing });
}));

//Create Route
app.post("/listings", validateListing,
     wrapAsync(async(req, res, next) => {
   
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
     }));
    

// Edit Route (Removed validateListing)
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing: listing });
}));



//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {
    
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
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
}));

// Route
//POST Reviews route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review added");
    res.redirect(`/listings/${listing._id}`);
    // res.send("Review added successfully");
}));

//DELETE Review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({ 
//         title: "Sample Listing",
//         description: "This is a sample listing",
//         image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
//         price: 100,
//         location: "Sample Location",
//         country: "Sample Country"
//     });
//     await sampleListing.save();
//     res.send("Listing saved");
// });

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Middleware for handling all errors cleanly
app.use((err, req, res, next) => {
    // Provide strict default fallbacks so the app never breaks on undefined properties
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () =>{
    console.log("Server is running on port 8080");
});