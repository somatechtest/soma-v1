import React from "react";
import { useState, useEffect } from 'react';
import { Configuration, OpenAIApi } from "openai"
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {  signOut,sendEmailVerification, sendPasswordResetEmail   } from "firebase/auth";
function Home() {

    
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState();


  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          const displayName = user.displayName;
            const email = user.email;
            const photoURL = user.photoURL;
            const emailVerified = user.emailVerified;
            if(!emailVerified){
                sendEmailVerification(auth.currentUser)
                .then(() => {
                    console.log("EMail verification sent please verify email")
                });
            }
          console.log("uid", uid)
        } else {
          navigate("/login");
          console.log("user is logged out")
        }
      });   
     
}, [])

// useEffect(()=>{
//     if (user !== null) {
//         // The user object has basic properties such as display name, email, etc.
//         const displayName = user.displayName;
//         const email = user.email;
//         const photoURL = user.photoURL;
//         const emailVerified = user.emailVerified;
      
//         // The user's ID, unique to the Firebase project. Do NOT use
//         // this value to authenticate with your backend server, if
//         // you have one. Use User.getToken() instead.
//         const uid = user.uid;
//       }
// },[])

const navigate = useNavigate();
 
    const handleLogout = () => {               
        signOut(auth).then(() => {
        // Sign-out successful.
            navigate("/login");
            console.log("Signed out successfully")
        }).catch((error) => {
        // An error happened.
        });
    }
    const resetPassword = () => {               
        const auth = getAuth();
        sendPasswordResetEmail(auth, auth.currentUser.email)
        .then(() => {
            console.log("Password reset mail sent to ",auth.currentUser.email)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("ERROR ",errorMessage)
            // ..
        });
    }

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const configuration = new Configuration({
      apiKey: process.env.REACT_APP_OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      //prompt: `Generate ${inputs.points} funny tweets from the summary of the below sentence  \n sentence: ${inputs.paragraph}`,
      prompt: `write ${inputs.points} long tweets in heroic tone summarizing the sentence   \n sentence: ${inputs.paragraph} \n Tweet 1:`,  
      // prompt: `Generate ${inputs.points} funny tweets from the key points from the below sentence  \n sentence: ${inputs.paragraph}`,
     // prompt: `summarise the sentence into ${inputs.points} points and generate hashtags for twitter for each point \n sentence: ${inputs.paragraph} \n tl;dr:`,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 1,
    });

    console.log("RESP",response)
    const text = response.data.choices[0].text;
   
    let pointsRegex = /^[0-9]+\. (.*)/gm;
    let points = text.match(pointsRegex);

    let hashtagsRegex = /#\w+/g;
    let hashtags = text.match(hashtagsRegex);
    // const output = input
    // .split('\n')
    // .filter(x => x.trim() != "")
    // .map(x => x.split('. ')[1]);

    // console.log("OUT",output)

    setResult(response.data.choices[0].text)
    console.log("POINTS ", points)
    console.log("Hashtags ",hashtags)
  }

  const getHashtags = async () => {
    
    const configuration = new Configuration({
      apiKey: process.env.REACT_APP_OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createCompletion({
      model: "text-curie-001",
      prompt: `Get me hashtags for the below sentence \n sentence: ${inputs.paragraph}`,
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 1,
    });

    console.log("RESP",response)
    // const input = response.data.choices[0].text;
    // const output = input
    // .split('\n')
    // .filter(x => x.trim() != "")
    // .map(x => x.split('. ')[1]);

    // console.log("HASHTAGS",output)

    setResult("HASHTAGS",response.data.choices[0].text)
  }
  async function refreshToken(){
    const auth = getAuth();
    // auth.onAuthStateChanged(function(user) {
    //   console.log("REF USER ",user)
    //   if (user) {
    //     console.log("REF USER ",user)
        
    //   }
    // });
    auth.currentUser.getIdToken().then(token=>{
      console.log("Token ",token)
      
  }).catch(err=>{
      console.log("error ",err)
  })
  }

    return(
        <div className="App">

<div>
        			<button onClick={handleLogout}>
                        Logout
                    </button>
                    <button onClick={resetPassword}>
                        Reset password
                    </button>
                    <button onClick={refreshToken}>
                      REFRESH
                    </button>
        		</div>
      <form onSubmit={handleSubmit}>
      <label>Text</label>
      <br/>
      <textArea 
        type="text" 
        name="paragraph" 
        value={inputs.paragraph || ""} 
        onChange={handleChange}
      />
      <br/>
      <label>Points</label>
      <br/>
        <input 
          type="number" 
          name="points" 
          value={inputs.points || ""} 
          onChange={handleChange}
        />
      <br/>
        
        <input type="submit" />
    </form>
    <button onClick={getHashtags}>Get Hashtags</button>
    <h3>RESULT<br/>{result}</h3>
    <div>
      <div>
    
      </div>
    
    </div>
    </div>
    );
}
export default Home;