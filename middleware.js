const jwt = require("jsonwebtoken");

function authmiddleware(req,res,next){
    const token=req.headers.token;
    const decoded=jwt.verify(token,"secret123123");
    req.user_id=decoded.user_id;
    next();
}


module.exports = {
    authmiddleware
};