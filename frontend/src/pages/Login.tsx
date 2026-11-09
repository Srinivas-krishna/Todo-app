import { useState } from "react";
import "../App.css";
import API from "../api";
import { Link,useNavigate } from "react-router-dom";

function Login(){
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const navigate=useNavigate();
    const handleLogin = async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const response = await API.post("/signin",{
                username,
                password,
            });
            console.log(response.data);
            localStorage.setItem("token",response.data.token);
            alert("Login successful!");
            navigate("/dashboard");
        }catch(error){
            console.log(error);
            alert("Login Failed!");
        }
    };
    return(
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit">LOGIN</button>
            </form>
            <p>Don't have an account?<Link to="/signup">Signup</Link></p>
        </div>  
    );
}
export default Login;