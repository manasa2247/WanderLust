const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email : {
        type : String,
        required :true
    }
});
//passport-local mongoose adds a its own username,hash,salt field 
//to store the username,the hashed password and the salt value
//even though u give a username field it still adds its own default username to every user
//thats why we are not defining username ,password fields in schema



userSchema.plugin(passportLocalMongoose);
//by this line u r plugging in the plm to do the above mentioned work for us
module.exports = mongoose.model("User",userSchema);

//plm also provides some methods to username ,passwords for them to be authenticated 
//so that we dont need to write functions from scratch to authenticate them