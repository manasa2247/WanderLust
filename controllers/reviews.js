const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req,res) => {
    console.log("jii");
    let { id,reviewId} = req.params;
    console.log(id);
    console.log(reviewId);
    await Listing.findByIdAndUpdate(id , {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted successfully!");
    res.redirect(`/listings/${id}`);
};
