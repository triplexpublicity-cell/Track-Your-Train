// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJQA-4BMrYJNkKF951XFrD5JHS7BkH224",
  authDomain: "track-your-train-1177f.firebaseapp.com",
  projectId: "track-your-train-1177f",
  storageBucket: "track-your-train-1177f.firebasestorage.app",
  messagingSenderId: "99335702047",
  appId: "1:99335702047:web:0e451ef4fab522313db72a",
  measurementId: "G-302JC7MVES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);// Replace the values below with the firebaseConfig shown in Firebase Console.
// Do NOT put your RailRadar secret key here.
window.TRACK_TRAIN_FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
