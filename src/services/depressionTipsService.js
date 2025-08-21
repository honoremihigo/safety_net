import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new depression tip
export const addDepressionTip = async (tipData) => {
  try {
    const { tip, title } = tipData;
    if (!tip || !title) {
      throw new Error("Tip and title are required");
    }

    const tipRef = await addDoc(collection(db, "depression_tips"), {
      tip,
      title,
      createdAt: new Date().toISOString()
    });

    return { id: tipRef.id, tip, title };
  } catch (error) {
    throw new Error(error.message || "Failed to add depression tip");
  }
};

// Get all depression tips
export const getAllDepressionTips = async () => {
  try {
    const tipsRef = collection(db, "depression_tips");
    const querySnapshot = await getDocs(tipsRef);
    const tips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return tips;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch depression tips");
  }
};

// Get a single depression tip by ID
export const getDepressionTipById = async (id) => {
  try {
    const tipRef = doc(db, "depression_tips", id);
    const tipDoc = await getDoc(tipRef);
    if (!tipDoc.exists()) {
      throw new Error("Depression tip not found");
    }
    return { id: tipDoc.id, ...tipDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch depression tip");
  }
};

// Update a depression tip
export const updateDepressionTip = async (id, updatedData) => {
  try {
    const { tip, title } = updatedData;
    if (!tip || !title) {
      throw new Error("Tip and title are required");
    }

    const tipRef = doc(db, "depression_tips", id);
    await updateDoc(tipRef, {
      tip,
      title,
      updatedAt: new Date().toISOString()
    });

    return { id, tip, title };
  } catch (error) {
    throw new Error(error.message || "Failed to update depression tip");
  }
};

// Delete a depression tip
export const deleteDepressionTip = async (id) => {
  try {
    const tipRef = doc(db, "depression_tips", id);
    await deleteDoc(tipRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete depression tip");
  }
};
