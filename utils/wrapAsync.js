module.exports = (fn) => {
    return function(req,res,next){
        fn(req,res,next).catch((err) => next(err));
    }
} //just function wrapAsync(fn) => {} 
//written as a Async function