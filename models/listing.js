// models/listing.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // CHANGED: Converted from a single object to an Array of objects
    image: [
        {
            url: String,
            filename: String
        }
    ],
    price: {
        type: Number,
        required: true
    },
    location: String,
    country: String,
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic cities", "Mountains", "Castles", "Amazing pools", "Camping", "Farms", "Arctic", "Beachfront", "Cabins"],
        required: false
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    }
});

listingSchema.post('findOneAndDelete', async function(doc) {
    if (doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;