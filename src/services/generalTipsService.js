import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new general tip
export const addGeneralTip = async (tipData) => {
  try {
    const { title, content } = tipData;
    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    const tipRef = await addDoc(collection(db, "general_tips"), {
      title,
      content,
      createdAt: new Date().toISOString()
    });

    return { id: tipRef.id, title, content };
  } catch (error) {
    throw new Error(error.message || "Failed to add tip");
  }
};

// Get all general tips
export const getAllGeneralTips = async () => {
  try {
    const tipsRef = collection(db, "general_tips");
    const querySnapshot = await getDocs(tipsRef);
    const tips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return tips;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch tips");
  }
};

// Get a single general tip by ID
export const getGeneralTipById = async (id) => {
  try {
    const tipRef = doc(db, "general_tips", id);
    const tipDoc = await getDoc(tipRef);
    if (!tipDoc.exists()) {
      throw new Error("Tip not found");
    }
    return { id: tipDoc.id, ...tipDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch tip");
  }
};

// Update a general tip
export const updateGeneralTip = async (id, updatedData) => {
  try {
    const { title, content } = updatedData;
    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    const tipRef = doc(db, "general_tips", id);
    await updateDoc(tipRef, {
      title,
      content,
      updatedAt: new Date().toISOString()
    });

    return { id, title, content };
  } catch (error) {
    throw new Error(error.message || "Failed to update tip");
  }
};

// Delete a general tip
export const deleteGeneralTip = async (id) => {
  try {
    const tipRef = doc(db, "general_tips", id);
    await deleteDoc(tipRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete tip");
  }
};
