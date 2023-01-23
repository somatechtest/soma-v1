// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBvd0w6iKoET8r4_BHnnetyvS3uZ7Cb1Uo",
    authDomain: "athread-75532.firebaseapp.com",
    projectId: "athread-75532",
    storageBucket: "athread-75532.appspot.com",
    messagingSenderId: "828724944675",
    appId: "1:828724944675:web:69bef42e4d2ece21237696",
    measurementId: "G-7QWC8K0G9Q"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  export const auth = getAuth(app);
export default app;
  