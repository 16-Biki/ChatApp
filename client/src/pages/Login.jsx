import React from 'react'
import {useNavigate} from "react-router-dom"
import axios from "axios"
import { useState } from 'react'
import "./Auth.css"
function Login({setUser}) {
    const [form,setForm]=useState({email:"",passsword:""});
    const navigate=useNavigate();
    const handlechange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }
    const handlesubmit=async(e)=>{
        e.preventDefault();
        try {
            const res= await axios.post("https://chatapp-htm4.onrender.com/api/auth/login",form);
            localStorage.setItem("chatUser",JSON.stringify(res.data.user))
            setUser(res.data.user)
            navigate("/chat");
        } catch (error) {
           alert(error.response?.data?.msg || "Invalid email or password")
        }
    }

  return (
    <div className='auth-container'>
       <h1>ChatApp</h1>
        <form onSubmit={handlesubmit}>
            <input type="email" name="email" 
            placeholder='enter email'
            onChange={handlechange}
            required />
            <br />
            <input type="password"
            name="password"
            placeholder='enter password'
            onChange={handlechange}
            required /> 
            <br /> 
            <button type='submit'>Login</button>
        </form>
        <p>Don't have an account?
        <button onClick={()=>navigate("/signup")}>Signup</button></p>
    </div>
  )
}

export default Login