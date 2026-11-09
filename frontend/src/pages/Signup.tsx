import { useState } from "react";
import API from "../api";
import { Link,useNavigate } from "react-router-dom";

function Signup(){
    const [username,setUsername]=useState(" ");
    const [password,setPassword]=useState(" ");
    const navigate = useNavigate();

    const handleSignup = async(e: React.FormEvent)=>{
        e.preventDefault();

        try{
            const response=await API.post("./signup",{
                username,
                password,
            });
            alert(response.data.message);
            navigate("/");
        }catch(error:any){
            console.log(error);
            alert(error.response?.data?.message || "Signup Failed");
        }
    };
    return(
        <div className="login-container">
            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="username" value={ username } onChange={(e)=>setUsername(e.target.value)}/>
                <input type="password" placeholder="password" value={ password } onChange={(e)=>setPassword(e.target.value)}/>
                <button type = "submit">SIGN UP</button>
            </form>
            <p>
                Already have an account?
                <Link to="/">Login</Link>
            </p>
        </div>
    );
}
export default Signup;