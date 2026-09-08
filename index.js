require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { authmiddleware } = require("./middleware");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
        console.log("Database:", mongoose.connection.db.databaseName);
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });


const app=express();
app.use(express.json());

// let current_user_id=1;
// let current_todo_id=1;

// const users=[];
// const todos=[];
const { userModel, todoModel } = require("./models");


//Sign-Up endpoint
app.post("/signup",async(req,res) =>{
    const username=req.body.username;
    const password=req.body.password;
    // const userExists=users.find(u=>u.username===username);
    const userExists = await userModel.findOne({ username : username });
    if(userExists){
        return res.status(403).json({
            message: "Username is already taken..."
        });
    }
    // await userModel.create({
    //     username: username,
    //     password: password
    // });
    const newUser = await userModel.create({
        username:username,
        password:password
    });
    console.log("NEW USER: ",newUser);
    res.json({
        message:"You have signed up successfully!!"
    });
});


//Sign-in Endpoint
app.post("/signin",async(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    // const userExists=users.find(u=>u.username===username && u.password===password);
    const userExists = await userModel.findOne({
        username:username,
        password:password
    });
    if(!userExists){
        return res.status(403).json({
            message:"Credentials do not match..."
        });
    };
    const token=jwt.sign(
        {
            user_id:userExists._id,
        },"secret123123"
    );
    res.json({
        token:token,
    });
});


//post todo endpoint
app.post("/todo",authmiddleware,async(req,res)=>{
    const user_id=req.user_id;
    const title=req.body.title;
    const description=req.body.description;

    await todoModel.create({
        title:title,
        description:description,
        user_id:user_id
    });

    res.json({
        message:"todo activity added successfully",
    });
});


//get todos endpoint
app.get("/todos",authmiddleware,async(req,res)=>{
    const user_id=req.user_id;
    const user_todos = await todoModel.find({
        user_id:user_id,
    });
    res.json({
        todos:user_todos,
    });
});


app.listen(3000,()=>{
    console.log("server running on port 3000.....");
});