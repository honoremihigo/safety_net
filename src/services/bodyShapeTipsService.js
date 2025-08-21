import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new body shape tip
export const addBodyShapeTip = async (tipData) => {
  try {
    const { title, content, category } = tipData;
    if (!title || !content || !category) {
      throw new Error("Title, content, and category are required");
    }

    const tipRef = await addDoc(collection(db, "body_shape_tips"), {
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

// Get all body shape tips
export const getAllBodyShapeTips = async () => {
  try {
    const tipsRef = collection(db, "body_shape_tips");
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

// Get a single body shape tip by ID
export const getBodyShapeTipById = async (id) => {
  try {
    const tipRef = doc(db, "body_shape_tips", id);
    const tipDoc = await getDoc(tipRef);
    if (!tipDoc.exists()) {
      throw new Error("Tip not found");
    }
    return { id: tipDoc.id, ...tipDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch tip");
  }
};

// Update a body shape tip
export const updateBodyShapeTip = async (id, updatedData) => {
  try {
    const { title, content, category } = updatedData;
    if (!title || !content || !category) {
      throw new Error("Title, content, and category are required");
    }

    const tipRef = doc(db, "body_shape_tips", id);
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

// Delete a body shape tip
export const deleteBodyShapeTip = async (id) => {
  try {
    const tipRef = doc(db, "body_shape_tips", id);
    await deleteDoc(tipRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete tip");
  }
};
