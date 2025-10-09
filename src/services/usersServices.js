import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

// Add a new user
export const addUser = async (userData) => {
  try {
    const { email, lastname, firstname } = userData;
    if (!email || !lastname || !firstname) {
      throw new Error("Email, lastname, and firstname are required");
    }

    const userRef = await addDoc(collection(db, "users"), {
      email,
      lastname,
      firstname,
      createdAt: new Date().toISOString()
    });

    return { id: userRef.id, email, lastname, firstname };
  } catch (error) {
    throw new Error(error.message || "Failed to add user");
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return users;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch users");
  }
};

// Get a single user by ID
export const getUserById = async (id) => {
  try {
    const userRef = doc(db, "users", id);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user");
  }
};// ✅ Get user activity logs by user ID
export const getUserLogsById = async (userId) => {
  try {
    const logsRef = collection(db, "user_activity_logs");
    const q = query(logsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return logs;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user activity logs");
  }
};


// Update a user
export const updateUser = async (id, updatedData) => {
  try {
    const { email, lastname, firstname } = updatedData;
    if (!email || !lastname || !firstname) {
      throw new Error("Email, lastname, and firstname are required");
    }

    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      email,
      lastname,
      firstname,
      updatedAt: new Date().toISOString()
    });

    return { id, email, lastname, firstname };
  } catch (error) {
    throw new Error(error.message || "Failed to update user");
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete user");
  }
};