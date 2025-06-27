// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCq7mRny3QomU-ctaFqmbsGbYueOzoDavs",
  authDomain: "finance-app-6346d.firebaseapp.com",
  projectId: "finance-app-6346d",
  storageBucket: "finance-app-6346d.firebasestorage.app",
  messagingSenderId: "78385795138",
  appId: "1:78385795138:web:ff8f5ddd9129cf06f6dddb",
  measurementId: "G-NMFC54W1HP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 