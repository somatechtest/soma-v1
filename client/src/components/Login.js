import React, {useState} from 'react';
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import { auth } from '../firebase';
import axios from "axios"
import { NavLink, useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; 

const provider = new GoogleAuthProvider();  

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate()
       
    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            auth.currentUser.getIdToken().then(token=>{
                console.log("Token ",token)
                axios.post("http://localhost:9000/api/v1/auth/login",{loginWithGoogle:false},{
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
             navigate("/home")
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
       
    }
    const handleSignInWithGoogle = ()=>{
        const auth = getAuth();
       
        signInWithPopup(auth, provider)
          .then((result) => {
            
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log("USER ",user)
            console.log(user);
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
 
    return(
        <>
            <main >        
                <section>
                    <div>                                            
                        <p> FocusApp </p>                       
                                                       
                        <form>                                              
                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"                                    
                                    required                                                                                
                                    placeholder="Email address"
                                    onChange={(e)=>setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"                                    
                                    required                                                                                
                                    placeholder="Password"
                                    onChange={(e)=>setPassword(e.target.value)}
                                />
                            </div>
                                                
                            <div>
                                <button                                    
                                    onClick={onLogin}                                        
                                >      
                                    Login                                                                  
                                </button>
                            </div>                               
                        </form>
                       
                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <NavLink to="/signup">
                                Sign up
                            </NavLink>
                        </p>

                        <button                                    
                                    onClick={handleSignInWithGoogle}                                        
                                >      
                                    Login with GOOGLE                                                                  
                                </button>
                                                   
                    </div>
                </section>
            </main>
        </>
    )
}
 
export default Login