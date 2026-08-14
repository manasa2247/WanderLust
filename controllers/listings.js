const Listing = require("../models/listings.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {

    const { category, search } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(
            search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filter.$or = [
            { location: searchRegex },
            { country: searchRegex }
        ];
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        category,
        search
    });
};

module.exports.renderNewForm = (req,res) => {
    console.log(req.user);
    //req.user has the user details of the cuurent session
    //this is used by isAuthenticated() function to authenticate if the user is logged in or not
    res.render("listings/newform.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const currListing = await Listing.findById(id)
    .populate({ //nested populate to populate the author of each review
        path:"reviews",
        populate: {
            path : "author",
        },
     })
     .populate("owner");
    if(!currListing){
        req.flash("error","Listing you requested for doesnot exist!");
        return res.redirect("/listings");
    }
    console.log(currListing);
    res.render("listings/show.ejs" , {currListing});
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for doesnot exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_200,w_250");
    res.render("listings/edit.ejs", {listing , originalImageUrl});
};

module.exports.createListing =  async (req,res,next) =>{
        let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
          .send();

        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url , filename};

        newListing.geometry = response.body.features[0].geometry;

        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success","New Listing created!");
        res.redirect("/listings"); 
};

module.exports.updateListing = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) =>{
    let {id} =req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted successfully!");
    res.redirect("/listings");
};

// ADDED: Search suggestions endpoint for the navbar search bar
module.exports.searchSuggestions = async (req, res) => {
    const q = (req.query.q || '').trim();

    if (!q) {
        return res.json([]);
    }

    const searchRegex = new RegExp(
        q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
    );

    const listings = await Listing.find({
        $or: [
            { location: searchRegex },
            { country: searchRegex },
            { title: searchRegex }
        ]
    })
    .select('location country title')
    .limit(10);

    const suggestions = [];
    const seen = new Set();

    for (const listing of listings) {
        const values = [listing.location, listing.country];

        for (const value of values) {
            if (value && value.toLowerCase().includes(q.toLowerCase())) {
                const key = value.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    suggestions.push(value);
                }
            }
        }
    }

    res.json(suggestions.slice(0, 8));
};
