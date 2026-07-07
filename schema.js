const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        // Define image as an object containing filename and url string checks
        image: Joi.object({
            filename: Joi.string().allow("", null).default("listingimage"),
            url: Joi.string().allow("", null).default("https://images.unsplash.com/photo-1506744038136-46273834b3fb")
        }),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});