const express = require("express");
const jwt = require("jsonwebtoken");
const { authmiddleware } = require("./middleware");

const app=express();
app.use(express.json());

let current_user_id=1;
let current_todo_id=1;

const users=[];
const todos=[];


//Sign-Up endpoint
app.post("/signup",(req,res) =>{
    const username=req.body.username;
    const password=req.body.password;
    const userExists=users.find(u=>u.username===username);
    if(userExists){
        return res.status(403).json({
            message: "Username is already taken..."
        });
    }
    users.push({
        id:current_user_id++,
        username:username,
        password:password,
    });
    res.json({
        message:"You have signed up successfully!!"
    });
});


//Sign-in Endpoint
app.post("/signin",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const userExists=users.find(u=>u.username===username && u.password===password);
    if(!userExists){
        return res.status(403).json({
            message:"Credentials do not match..."
        });
    };
    const token=jwt.sign(
        {
            user_id:userExists.id,
        },"secret123123"
    );
    res.json({
        token:token,
    });
});


//post todo endpoint
app.post("/todo",authmiddleware,(req,res)=>{
    const user_id=req.user_id;
    const title=req.body.title;
    const description=req.body.description;

    todos.push(
        {
            id:current_todo_id++,
            title:title,
            description:description,
            user_id:user_id
        }
    );
    res.json({
        message:"todo activity added successfully",
    });
});


//get todos endpoint
app.get("/todos",authmiddleware,(req,res)=>{
    const user_id=req.user_id;
    const user_todos=todos.filter(
        t => t.user_id===user_id,
    )
    res.json({
        todos:user_todos,
    });
});


app.listen(3000,()=>{
    console.log("server running on port 3000.....");
});