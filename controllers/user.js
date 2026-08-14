const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res) => {
    try{
        let { username, email ,password } =req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        //the down req.login() [passports method] method id for making user automatically login when he first signs up onto the website
        req.login(registeredUser , (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success" , "Welcome to Wanderlust!");
            res.redirect("/listings");
        });   
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }   
};

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
        req.flash("success","Welcome back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings"; //like short hand if 
        console.log("before redirect");
        res.redirect(redirectUrl);
        console.log("after redirect");
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success","u are logged out now");
        res.redirect("/listings");
    })
    
};