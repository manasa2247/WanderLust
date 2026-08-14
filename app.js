if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
//above thing means we only use dotenv in development environment
//we should not use it in production environment coz .env has our cloudinary credentials in it


const express = require("express");
const  app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const dbUrl = process.env.ATLASDB_URL;

main()
    .then((res) => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    })
    
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended :  true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {//for encryption
      secret : process.env.SECRET,
    },
    touchAfter : 24*3600,//its the time b/w the session info updates ,it says if there is no change in the session
    //no change in session menas not interacting with the db,
    //it says when there is no such change in the session info update the session info only after 24 hrs
});

store.on("error" ,() => {
    console.log("ERROR in MONGO SESSION STORE" , err);
});

const sessionOptions = {
    store, //MongoStore info
    secret : process.env.SECRET,
    resave : false ,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000 , //extra time in milliseconds
        maxAge : 7*24*60*60*1000 ,
        httpOnly : true,//for security reasons(to prevent crossscripting attacks)
    },
};

// app.get("/",(req,res)=>{
//     res.send("this is root");
// });



app.use(session(sessionOptions));
app.use(flash());//u need to write this before the app.use("/listings",listings) or any routes coz flash uses routes

app.use(passport.initialize());//a middleware that initilizes the passport 
//means set some things(our strategy i.e fields of user like username,password in it
app.use(passport.session());
passport.use(new LocalStrategy( User.authenticate() ) ); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//serialze - store session info //deserialize -unstore (delete) the session info of user


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    //u can acess this info even when not passed directly to any ejs file 
    //coz as they are saved to res.locals
    next();
});

 app.get("/demouser",async (req,res) => {
    let fakeUser = new User({
        email : "kartheek@gmail.com",
        username : "kartheek-student",
    });

    let registeredUser = await User.register(fakeUser, "helloWorld");
    //register method of passport automatically stores the fakeUser with helloWorld[u gave] as password in DB
    //register method checks if such username(which u r passing) already exists in DB or not
    res.send(registeredUser);
 });

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" ,userRouter);

// Handle localhost:8080/
app.all("/", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.all('/*splat', (req,res,next) => {
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) => {
    let { statusCode = 500 , message = "Something went Wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs",{ message });
});

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});