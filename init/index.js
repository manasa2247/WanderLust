const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then((res) => {
        console.log("connected successfully");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany();
    initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner :"6a78208be90f9d0dcc70e516" 
    }));//owner :m-student
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();