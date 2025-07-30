// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv5FcEcHYkBi1-EjQafljdo3Z9RbNhAvM",
  authDomain: "quizz-7c1a4.firebaseapp.com",
  projectId: "quizz-7c1a4",
  storageBucket: "quizz-7c1a4.firebasestorage.app",
  messagingSenderId: "433914094017",
  appId: "1:433914094017:web:7842cc42f01adf707e4f40",
  measurementId: "G-EXDWFQFY2S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;