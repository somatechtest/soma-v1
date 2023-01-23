import React, {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebase';
import axios from "axios"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; 


const provider = new GoogleAuthProvider();  



const Signup = () => {
    const navigate = useNavigate();
 
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
 

    const handleSignUpWithGoogle = ()=>{
        const auth = getAuth();
        
        signInWithPopup(auth, provider)
          .then((result) => {
            
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            auth.currentUser.getIdToken().then(token=>{
                console.log("Token ",token)
                axios.post("http://localhost:9000/api/v1/auth/login",{loginWithGoogle:true},{
                    headers:{
                        Authorization :`Bearer ${token}`
                    }
                }).then(res=>{
                    console.log(res.data)
                }).catch(err=>{
                    console.log("err ",err)
                })
            }).catch(err=>{
                console.log("error ",err)
            })
            console.log("USER ",user)
            navigate("/home")
            // ...
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log("ERROR ",errorMessage)
            // ...
          });
        
    }

    const onSubmit = async (e) => {
      e.preventDefault()
     
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user
            console.log(user);
            auth.currentUser.getIdToken().then(token=>{
                console.log("Token ",token)
                axios.post("http://localhost:9000/api/v1/auth/signup",{"name":email.split("@")[0],"loginWithGoogle":false},{
                    headers:{
                        Authorization :`Bearer ${token}`
                    }
                }).then(res=>{
                    console.log(res.data)
                }).catch(err=>{
                    console.log("err ",err)
                })
            }).catch(err=>{
                console.log("error ",err)
            })
            // navigate("/login")
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            // ..
        });
 
   
    }
 
  return (
    <main >        
        <section>
            <div>
                <div>                  
                    <h1> FocusApp </h1>                                                                            
                    <form>                                                                                            
                        <div>
                            <label htmlFor="email-address">
                                Email address
                            </label>
                            <input
                                type="email"
                                label="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}  
                                required                                    
                                placeholder="Email address"                                
                            />
                        </div>

                        <div>
                            <label htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                label="Create password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required                                 
                                placeholder="Password"              
                            />
                        </div>                                             
                        
                        <button
                            type="submit" 
                            onClick={onSubmit}                        
                        >  
                            Sign up                                
                        </button>
                                                                     
                    </form>


                   
                    <p>
                        Already have an account?{' '}
                        <NavLink to="/login" >
                            Sign in
                        </NavLink>
                    </p>        


                    <button
                            type="submit" 
                            onClick={handleSignUpWithGoogle}                        
                        >  
                            Sign up with GOOGLE                               
                        </button>           
                </div>
            </div>
        </section>
    </main>
  )
}
 
export default Signup