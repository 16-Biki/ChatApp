import React from 'react'
import axios from "axios";
import {useNavigate} from "react-router-dom"

import { useState } from 'react';
import "./Auth.css"

function Signup() {
    const [form,setForm]=useState({username:"",email:"",password:""});
    const navigate=useNavigate();
    const handlechange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }
    const handlesubmit=async(e)=>{
        e.preventDefault();
        try {
            await axios.post("https://chatapp-htm4.onrender.com/api/auth/signup",form);
            alert("signup successfull now go to the log in page");
            navigate("/login");
        } catch (error) {
            alert(err.response?.data?.msg||"signup failed");   
        }
    }

  return (
    <div className='auth-container'>
        <h1>ChatApp</h1>
        <form onSubmit={handlesubmit}>
            <input
            name='username'
            placeholder='enter name'
            onChange={handlechange}
            required />
            <br />
            <input type='email'
            name='email'
            placeholder='enter email'
            onChange={handlechange}
            required />
            <br />
            <input type="password"
            name='password'
            placeholder='enter password'
            onChange={handlechange}
            required /> <br />
            <button type='submit'>Sign Up</button>
        </form>
        <p>already have an account?
        <button onClick={()=>navigate("/login")}>Login</button></p>


    </div>
  )
}

export default Signup