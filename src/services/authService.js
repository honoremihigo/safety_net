// services/authService.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// // Login user by checking admin table
// export const login = async (email, password) => {
//   try {
//     // Query the admin collection to find user with matching email and password
//     const adminRef = collection(db, "admins");
//     const q = query(
//       adminRef,
//       where("adminEmail", "==", email),
//       where("password", "==", password)
//     );

//     const querySnapshot = await getDocs(q);
//     if (querySnapshot.empty) {
//       throw new Error("Invalid email or password");
//     }

//     // Get the first matching admin document
//     const adminDoc = querySnapshot.docs[0];
//     const adminData = {
//       id: adminDoc.id,
//       ...adminDoc.data()
//     };
    
//     // Store user data in localStorage
//     localStorage.setItem("currentUser", JSON.stringify(adminData));
//     localStorage.setItem("isAuthenticated", "true");
    
//     return adminData;
//   } catch (error) {
//     throw new Error(error.message || "Login failed");
//   }
// };


export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user safely in localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

    return user;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};

// Logout user
export const logout = async () => {
  try {
    alert('Logged out successfully');
    localStorage.setItem("currentUser",null);
    localStorage.setItem("isAuthenticated",null);
    return true;
  } catch (error) {
    throw new Error("Logout failed");
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};