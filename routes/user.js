const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { route } = require("./listing.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local",{
            failureRedirect : "/login",
            failureFlash : true,
        }),//when a post request comes on route "/login"
        //first passport middleware authenticate() authenticates the data we passed
        //and based on the options we gave if authentication fails the redirects to "/login" page 
        //and also flashes a message saying what exactly went wrong
        //if authentication successful then the flow continues to next middleware/functoin/send response 
        userController.login
    );

router.get("/logout" , userController.logout);

module.exports = router;