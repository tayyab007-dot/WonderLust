const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required().min(3).max(100), // Enforces realistic bounds
        description: Joi.string().required().min(10).max(2000), // Stops massive payload data dumps
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(1), // Blocks 0 or negative price exploits

        // 1. MULTI-IMAGE ARRAY VALIDATION WITH SECURE URI PATH PATTERNS
        image: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().allow("", null), // Validates clean, formal URL patterns
                filename: Joi.string().allow("", null)
            })
        ).allow("", null),

        // 2. STRICT DROPDOWN SELECTION CATEGORY ENUMERATION
        category: Joi.string().valid(
            "Trending", "Rooms", "Iconic cities", "Mountains", "Castles", 
            "Amazing pools", "Camping", "Farms", "Arctic", "Beachfront", "Cabins"
        ).required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required().max(500) // Enforces clean comment length boundaries
    }).required()
});