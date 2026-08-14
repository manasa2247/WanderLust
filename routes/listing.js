const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listings.js");
const { isLoggedIn, isOwner ,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");//a npm package used to parse files /mutifrom data
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});//the files we upload (images) will be stored in the storage i.e cloudinary

router
    .route("/")
    .get(wrapAsync(listingController.index))//INDEX ROUTE
    .post( //CREATE ROUTE
        isLoggedIn , 
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );


// ADDED: Search suggestions route
router.get("/suggestions", wrapAsync(listingController.searchSuggestions));

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))//SHOW ROUTE
    .put( //UPDATE ROUTE
        isLoggedIn ,
        isOwner ,  
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete( //DELETE ROUTE 
        isLoggedIn, 
        isOwner , 
        wrapAsync(listingController.destroyListing)
    );

//EDIT ROUTE
router.get("/:id/edit" ,isLoggedIn, isOwner , wrapAsync(listingController.renderEditForm));

module.exports = router;