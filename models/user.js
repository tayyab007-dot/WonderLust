// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-local-mongoose');

// const userSchema = new Schema({
    
//     email: {
//         type: String,
//         required: true
//     }
// });

// userSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// Fix: Handles both standard function exports and ES module object wraps safely
if (typeof passportLocalMongoose === 'function') {
    userSchema.plugin(passportLocalMongoose);
} else {
    userSchema.plugin(passportLocalMongoose.default);
}

module.exports = mongoose.model('User', userSchema);