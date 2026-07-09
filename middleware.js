// module.exports.isLoggedIn = (req, res, next) => {
//   if (!req.isAuthenticated()) {
//     req.session.redirectUrl = req.originalUrl;
//     req.flash("error", "You must be signed in to create a new listing!");
//     return res.redirect("/login");
//   }
//   next();
// };

// module.exports.saveRedirectUrl = (req, res, next) => {
//   if (req.session.redirectUrl) {
//     req.session.redirectUrl = req.session.redirectUrl;
//   }
//   // req.session.redirectURL = req.session.redirectURL;
//   next();
// };

// // module.exports = { isLoggedIn };



module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // Saves where the user was trying to go
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    // FIX: Move it from session to res.locals before passport clears the session
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};