// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5TDVzXuKf1xL6-9TpBn3wYovMarY205o",
  authDomain: "green-tech-2e9ed.firebaseapp.com",
  projectId: "green-tech-2e9ed",
  storageBucket: "green-tech-2e9ed.firebasestorage.app",
  messagingSenderId: "928906394279",
  appId: "1:928906394279:web:6310b5515f3e63f813f982",
  measurementId: "G-6FXRBH7QXL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth and Google Auth Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();