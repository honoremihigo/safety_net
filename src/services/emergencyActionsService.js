import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// Add a new emergency action
export const addEmergencyAction = async (actionData) => {
  try {
    const { action, contact, userId } = actionData;
    if (!action || !contact || !userId) {
      throw new Error("Action, contact, and userId are required");
    }

    const actionRef = await addDoc(collection(db, "emergency_actions"), {
      action,
      contact,
      userId,
      timestamp: serverTimestamp()
    });

    return { id: actionRef.id, action, contact, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to add emergency action");
  }
};

// Get all emergency actions
export const getAllEmergencyActions = async () => {
  try {
    const actionsRef = collection(db, "emergency_actions");
    const querySnapshot = await getDocs(actionsRef);
    const actions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return actions;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch emergency actions");
  }
};

// Get a single emergency action by ID
export const getEmergencyActionById = async (id) => {
  try {
    const actionRef = doc(db, "emergency_actions", id);
    const actionDoc = await getDoc(actionRef);
    if (!actionDoc.exists()) {
      throw new Error("Emergency action not found");
    }
    return { id: actionDoc.id, ...actionDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch emergency action");
  }
};

// Update an emergency action
export const updateEmergencyAction = async (id, updatedData) => {
  try {
    const { action, contact, userId } = updatedData;
    if (!action || !contact || !userId) {
      throw new Error("Action, contact, and userId are required");
    }

    const actionRef = doc(db, "emergency_actions", id);
    await updateDoc(actionRef, {
      action,
      contact,
      userId,
      updatedAt: new Date().toISOString()
    });

    return { id, action, contact, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to update emergency action");
  }
};

// Delete an emergency action
export const deleteEmergencyAction = async (id) => {
  try {
    const actionRef = doc(db, "emergency_actions", id);
    await deleteDoc(actionRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete emergency action");
  }
};
