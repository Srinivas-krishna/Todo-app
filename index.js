require("dotenv").config();
const cors= require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const { authmiddleware } = require("./middleware");
const bcrypt=require("bcrypt");
const { z, success }=require("zod");
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
const signupSchema=z.object({
    username:z.string().min(8).max(100),
    password:z.string().min(8).max(100)
})

const app=express();
app.use(cors({origin:"http://localhost:5173"}));
app.use(express.json());


const { userModel, todoModel } = require("./models");


//Sign-Up endpoint
app.post("/signup",async(req,res) =>{
    const result=signupSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            message:"Invalid input",
            errors: result.error.issues

    })
    }
    const username=result.data.username;
    const password=result.data.password;
    const allUsers = await pool.query("SELECT userid, username FROM users");
    console.log("Users visible to backend:", allUsers.rows);
    console.log("Username received:", JSON.stringify(username));
    const userExists=await pool.query(
        "SELECT userid FROM users WHERE username= $1",
        [username]
    );
    if (userExists.rows.length > 0){
        return res.status(403).json({
            message:"username is already taken"
        });
    }
    const hashedpassword=await bcrypt.hash(password,10);
    await pool.query(
        "INSERT INTO users (username,password) VALUES ($1,$2)",
        [username,hashedpassword]
    );
    res.json({
        message:"You have signed up successfully!!"
    });
});


//Sign-in Endpoint
// app.post("/signin",async(req,res)=>{
//     const username=req.body.username;
//     const password=req.body.password;

//     const userExists=await pool.query(
//         "SELECT userid,password FROM users WHERE username=$1",
//         [username]
//     );
//     console.log("Login username:", username);
//     console.log("User found:", userExists.rows.length > 0);
//     if(userExists.rows.length===0){
//         return res.status(403).json({
//             message:"Credentials do not match..."
//         });
//     };
//     const passwordmatch=await bcrypt.compare(password,userExists.rows[0].password);
//     console.log("Password matched:", passwordmatch);
//     if(!passwordmatch){
//         return res.status(403).json({
//             message:"Credentials do not match..."
//         });
//     }
//     const token=jwt.sign(
//         {
//             user_id: userExists.rows[0].userid
//         },"secret123123"
//     );
//     res.json({
//         token:token,
//     });
// });

//new signin endpoint

app.post("/signin", async (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password;

    const userExists = await pool.query(
        `SELECT userid, password
         FROM users
         WHERE BTRIM(username) = $1`,
        [username]
    );

    console.log("Username:", JSON.stringify(username));
    console.log("User found:", userExists.rows.length > 0);

    if (userExists.rows.length === 0) {
        return res.status(403).json({
            message: "Credentials do not match..."
        });
    }

    const passwordmatch = await bcrypt.compare(
        password,
        userExists.rows[0].password
    );

    console.log("Password matched:", passwordmatch);

    if (!passwordmatch) {
        return res.status(403).json({
            message: "Credentials do not match..."
        });
    }

    const token = jwt.sign(
        {
            user_id: userExists.rows[0].userid
        },
        "secret123123"
    );

    res.json({
        token: token
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


//update todos endpoint
app.put("/todo/:id",authmiddleware,async(req,res) => {
    const user_id = req.user_id;
    const todo_id = req.params.id;
    const { title, description, status } =  req.body;
    const result = await pool.query(
        `UPDATE todos 
        SET todoname = $1, description = $2, status = $3
        WHERE todoid = $4 AND userid = $5 
        RETURNING *`,
        [title, description, status, todo_id, user_id]
    );
    if(result.rows.length === 0){
        return res.status(404).json({
            messsage : "Todo not found",
        });
    }
    res.json({
        message:"Todo updated successfully!",
        todo: result.rows[0]
    });
});


//Delete Todo endpoint
app.delete("/todo/:id",authmiddleware,async(req,res) =>{
    const user_id = req.user_id;
    const todo_id = req.params.id;

    const result = await pool.query(
        "DELETE FROM todos WHERE todoid = $1 AND userid = $2 RETURNING *",[todo_id,user_id]
    );

    if(result.rows.length === 0){
        return res.status(404).json({
            message : "Todo not found",
        });
    }
    res.json({
        message : "Todo Deleted succesfully!",
    });
});


app.listen(3000,()=>{
    console.log("server running.");
});