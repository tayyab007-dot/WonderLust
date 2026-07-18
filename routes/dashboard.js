const express = require("express");
const router = express.Router();
const wrapAsync = require("../utlls/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const dashboardController = require("../controllers/dashboards.js");

// Secure root path tracking directly against /dashboard
router.get("/", isLoggedIn, wrapAsync(dashboardController.renderDashboard));

module.exports = router;