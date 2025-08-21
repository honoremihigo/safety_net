import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new panic attack tip
export const addPanicAttackTip = async (tipData) => {
  try {
    const { order, description, title } = tipData;
    if (order === undefined || !description || !title) {
      throw new Error("Order, description, and title are required");
    }

    const tipRef = await addDoc(collection(db, "panic_attack_tips"), {
      order,
      description,
      title,
      createdAt: new Date().toISOString()
    });

    return { id: tipRef.id, order, description, title };
  } catch (error) {
    throw new Error(error.message || "Failed to add panic attack tip");
  }
};

// Get all panic attack tips
export const getAllPanicAttackTips = async () => {
  try {
    const tipsRef = collection(db, "panic_attack_tips");
    const querySnapshot = await getDocs(tipsRef);
    const tips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return tips;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch panic attack tips");
  }
};

// Get a single panic attack tip by ID
export const getPanicAttackTipById = async (id) => {
  try {
    const tipRef = doc(db, "panic_attack_tips", id);
    const tipDoc = await getDoc(tipRef);
    if (!tipDoc.exists()) {
      throw new Error("Panic attack tip not found");
    }
    return { id: tipDoc.id, ...tipDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch panic attack tip");
  }
};

// Update a panic attack tip
export const updatePanicAttackTip = async (id, updatedData) => {
  try {
    const { order, description, title } = updatedData;
    if (order === undefined || !description || !title) {
      throw new Error("Order, description, and title are required");
    }

    const tipRef = doc(db, "panic_attack_tips", id);
    await updateDoc(tipRef, {
      order,
      description,
      title,
      updatedAt: new Date().toISOString()
    });

    return { id, order, description, title };
  } catch (error) {
    throw new Error(error.message || "Failed to update panic attack tip");
  }
};

// Delete a panic attack tip
export const deletePanicAttackTip = async (id) => {
  try {
    const tipRef = doc(db, "panic_attack_tips", id);
    await deleteDoc(tipRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete panic attack tip");
  }
};
