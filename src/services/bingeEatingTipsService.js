import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new binge eating tip
export const addTip = async (tipData) => {
  try {
    const { title, content, category } = tipData;
    if (!title || !content || !category) {
      throw new Error("Title, content, and category are required");
    }

    const tipRef = await addDoc(collection(db, "binge_eating_tips"), {
      title,
      content,
      category,
      createdAt: new Date().toISOString()
    });

    return { id: tipRef.id, title, content, category };
  } catch (error) {
    throw new Error(error.message || "Failed to add tip");
  }
};

// Get all binge eating tips
export const getAllTips = async () => {
  try {
    const tipsRef = collection(db, "binge_eating_tips");
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

// Get a single binge eating tip by ID
export const getTipById = async (id) => {
  try {
    const tipRef = doc(db, "binge_eating_tips", id);
    const tipDoc = await getDoc(tipRef);
    if (!tipDoc.exists()) {
      throw new Error("Tip not found");
    }
    return { id: tipDoc.id, ...tipDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch tip");
  }
};

// Update a binge eating tip
export const updateTip = async (id, updatedData) => {
  try {
    const { title, content, category } = updatedData;
    if (!title || !content || !category) {
      throw new Error("Title, content, and category are required");
    }

    const tipRef = doc(db, "binge_eating_tips", id);
    await updateDoc(tipRef, {
      title,
      content,
      category,
      updatedAt: new Date().toISOString()
    });

    return { id, title, content, category };
  } catch (error) {
    throw new Error(error.message || "Failed to update tip");
  }
};

// Delete a binge eating tip
export const deleteTip = async (id) => {
  try {
    const tipRef = doc(db, "binge_eating_tips", id);
    await deleteDoc(tipRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete tip");
  }
};