import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new self-harm coping strategy
export const addSelfHarmCopingStrategy = async (strategyData) => {
  try {
    const { category, color, icon, tips } = strategyData;
    if (!category || color === undefined || !icon || !Array.isArray(tips) || tips.length === 0) {
      throw new Error("Category, color, icon, and at least one tip are required");
    }

    const strategyRef = await addDoc(collection(db, "self_harm_coping_strategies"), {
      category,
      color,
      icon,
      tips,
      createdAt: new Date().toISOString()
    });

    return { id: strategyRef.id, category, color, icon, tips };
  } catch (error) {
    throw new Error(error.message || "Failed to add coping strategy");
  }
};

// Get all self-harm coping strategies
export const getAllSelfHarmCopingStrategies = async () => {
  try {
    const strategiesRef = collection(db, "self_harm_coping_strategies");
    const querySnapshot = await getDocs(strategiesRef);
    const strategies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return strategies;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch coping strategies");
  }
};

// Get a single self-harm coping strategy by ID
export const getSelfHarmCopingStrategyById = async (id) => {
  try {
    const strategyRef = doc(db, "self_harm_coping_strategies", id);
    const strategyDoc = await getDoc(strategyRef);
    if (!strategyDoc.exists()) {
      throw new Error("Coping strategy not found");
    }
    return { id: strategyDoc.id, ...strategyDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch coping strategy");
  }
};

// Update a self-harm coping strategy
export const updateSelfHarmCopingStrategy = async (id, updatedData) => {
  try {
    const { category, color, icon, tips } = updatedData;
    if (!category || color === undefined || !icon || !Array.isArray(tips) || tips.length === 0) {
      throw new Error("Category, color, icon, and at least one tip are required");
    }

    const strategyRef = doc(db, "self_harm_coping_strategies", id);
    await updateDoc(strategyRef, {
      category,
      color,
      icon,
      tips,
      updatedAt: new Date().toISOString()
    });

    return { id, category, color, icon, tips };
  } catch (error) {
    throw new Error(error.message || "Failed to update coping strategy");
  }
};

// Delete a self-harm coping strategy
export const deleteSelfHarmCopingStrategy = async (id) => {
  try {
    const strategyRef = doc(db, "self_harm_coping_strategies", id);
    await deleteDoc(strategyRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete coping strategy");
  }
};
