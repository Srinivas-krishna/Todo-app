require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { authmiddleware } = require("./middleware");

const { Pool } = require("pg");
const pool=new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
pool.query("SELECT NOW()")
    .then(result => {
        console.log("PostgreSQL connected:", result.rows[0]);
    })
    .catch(err => {
        console.log("PostgreSQL connection failed:", err);
    });


const app=express();
app.use(express.json());


const { userModel, todoModel } = require("./models");


//Sign-Up endpoint
app.post("/signup",async(req,res) =>{
    const username=req.body.username;
    const password=req.body.password;
    const userExists=await pool.query(
        "SELECT userid FROM users WHERE username= $1",
        [username]
    );
    if (userExists.rows.length > 0){
        return res.status(403).json({
            message:"username is already taken"
        });
    }
    await pool.query(
        "INSERT INTO users (username,password) VALUES ($1,$2)",
        [username,password]
    );
    res.json({
        message:"You have signed up successfully!!"
    });
});


//Sign-in Endpoint
app.post("/signin",async(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const userExists=await pool.query(
        "SELECT userid FROM users WHERE username=$1 AND password=$2",
        [username,password]
    )
    if(userExists.rows.length===0){
        return res.status(403).json({
            message:"Credentials do not match..."
        });
    };
    const token=jwt.sign(
        {
            user_id: userExists.rows[0].userid
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

    await pool.query(
        "INSERT INTO todos (userid,todoname,description,status) VALUES ($1,$2,$3,$4)",
        [user_id,title,description,false]
    );

    res.json({
        message:"todo activity added successfully",
    });
});


//get todos endpoint
app.get("/todos",authmiddleware,async(req,res)=>{
    const user_id=req.user_id;
    const result = await pool.query(
        "SELECT * FROM todos WHERE userid = $1",
        [user_id]
    )
    res.json({
        todos: result.rows
    });
});


app.listen(3000,()=>{
    console.log("server running on port 3000.....");
});