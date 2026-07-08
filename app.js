const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utlls/wrapAsync.js");
const ExpressError = require("./utlls/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(__dirname + "/public"));

const sessionOptions = {
  secret: "supersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

app.get("/", (req, res) => {
  res.send("Root is working");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
