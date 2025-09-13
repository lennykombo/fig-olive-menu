// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2Jar4_xeOECX3k8Cd4XU3hVF3vinTwP8",
  authDomain: "menu-4dc4e.firebaseapp.com",
  projectId: "menu-4dc4e",
  storageBucket: "menu-4dc4e.firebasestorage.app",
  messagingSenderId: "369611652370",
  appId: "1:369611652370:web:97646524d249254ede87cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore();
export default app;