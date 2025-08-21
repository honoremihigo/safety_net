import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxJBEj1hypEm0ljwOfntrml1SF8PfszuA",
  authDomain: "schoolmanagement-556ae.firebaseapp.com",
  projectId: "schoolmanagement-556ae",
  storageBucket: "schoolmanagement-556ae.firebasestorage.app",
  messagingSenderId: "447274015939",
  appId: "1:447274015939:web:9160d1b595822a4faad676",
  measurementId: "G-J37NP47SCV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore()