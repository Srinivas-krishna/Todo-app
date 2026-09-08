const mongoose = require("mongoose");


//user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

//todo schema
const todoSchema = new mongoose.Schema({
    title : String,
    description : String,
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "users"
    }
});

const userModel = mongoose.model("users",userSchema);
const todoModel = mongoose.model("todos", todoSchema);


module.exports = {
    userModel: userModel,
    todoModel: todoModel
};