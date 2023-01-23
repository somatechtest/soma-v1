import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route,Link} from 'react-router-dom';
import { Configuration, OpenAIApi } from "openai"
// Import the functions you need from the SDKs you need


import Home from "./components/Home"
import Signup from './components/SignUp';
import Login from './components/Login';
import Purchase from './components/Purchase';

function App() {

  return (
    <div>
      <div>
      <div>
      <Link to="/">Home </Link>
      <Link to="/signup">About Us </Link>
      <Link to="/login">Shop Now </Link>
    </div>
        <section>                              
            <Routes>
               <Route path="/" element={<Home/>}/>
               <Route path="/home" element={<Home/>}/>
               <Route path="/signup" element={<Signup/>}/>
               <Route path="/login" element={<Login/>}/>
               <Route path="/purchase" element={<Purchase/>}/>
            </Routes>                    
        </section>
      </div> 
      
    </div>
  );
}





export default App;
