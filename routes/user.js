const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require("../utlls/wrapAsync.js");
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try{
        const { username, email, password } = req.body;
    const newuser = new User({ username, email });
    const registeredUser = await User.register(newuser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    })
        
    }catch(e){
        // console.log(e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
    }));

    router.get("/login", (req, res) => {
        res.render("users/login.ejs");
    });

    router.post("/login", saveRedirectUrl, passport.authenticate("local",
         { failureRedirect: "/login", failureFlash: true  }),
         async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
        // res.redirect(res.locals.redirectUrl);
    });

    router.get("/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You have been logged out!");
            res.redirect("/listings");
        });
    });

module.exports = router;