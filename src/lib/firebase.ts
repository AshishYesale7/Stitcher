// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-6550566511-bfe33",
  "appId": "1:573585068434:web:2b5e3c63156861df17f14b",
  "storageBucket": "studio-6550566511-bfe33.firebasestorage.app",
  "apiKey": "AIzaSyCatApKbk4OYVRb9GB7rpaMs8_oOcvL9Jc",
  "authDomain": "studio-6550566511-bfe33.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "573585068434"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
