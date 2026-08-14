const express = require("express");
const router  = express.Router({mergeParams : true});
//when u need to use  parent routes paramters in its child route function like
//in /listings/:id/reviews/:reviewId the parameter id in req.body cant propagate from app.js file to review.js(in rotes folder),it stops at app.js =>not passed to review.js(in routes)
//to make that propagate u set mergeParams to true

const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listings.js");
const review = require("../models/review.js");
const {validateReview , isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
//Reviews
//Post Review Route
router.post("/", isLoggedIn , validateReview , wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn , isReviewAuthor , wrapAsync(reviewController.destroyReview));

module.exports = router;







