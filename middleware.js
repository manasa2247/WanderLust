const Listing = require("./models/listings.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema }  = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    //req.user has the user details of the cuurent session
        //this is used by isAuthenticated() function to authenticate if the user is logged in or not
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.get("Referer") || "/listings";
        //originalUrl contains the whole url after localhost:8080/ 
        //we will save that url and then after user logginin or sigining up we will redirect them to that originalUrl we saved before without defaultly redirecting to /listings 
        //any path or route has this req.session object available so no need to pass originalUrl it to some other files when we want to use it ,just direct use it ;
        //just use req.session.redirectUrl in other files when needed
        req.flash("error" , "you must be logged in make any changes" );
         return res.redirect("/login");
    }
    console.log("logged in!!");
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};//why this middleware ?? on logging in passport deletes req.session.redirectUrl so it will be undefined
//but passport wont delete locals ,so use locals

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
        let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","u are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
};

module.exports.validateListing = (req,res,next) => {
        let { error } = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(".");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};

module.exports.validateReview = (req,res,next) => {
    console.log("hiii");
        let { error } = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(".");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let {id, reviewId} = req.params;
        let review = await Review.findById(reviewId);
        console.log("hi");
        if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error","u are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
};

