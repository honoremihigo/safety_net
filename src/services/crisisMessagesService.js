import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// Add a new crisis message
export const addCrisisMessage = async (messageData) => {
  try {
    const { contact, email, firstName, lastName, message } = messageData;
    if (!contact || !email || !firstName || !lastName || !message) {
      throw new Error("Contact, email, firstName, lastName, and message are required");
    }

    const messageRef = await addDoc(collection(db, "crisis_messages"), {
      contact,
      email,
      firstName,
      lastName,
      message,
      timestamp: serverTimestamp()
    });

    return { id: messageRef.id, contact, email, firstName, lastName, message };
  } catch (error) {
    throw new Error(error.message || "Failed to add crisis message");
  }
};

// Get all crisis messages
export const getAllCrisisMessages = async () => {
  try {
    const messagesRef = collection(db, "crisis_messages");
    const querySnapshot = await getDocs(messagesRef);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return messages;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch crisis messages");
  }
};

// Get a single crisis message by ID
export const getCrisisMessageById = async (id) => {
  try {
    const messageRef = doc(db, "crisis_messages", id);
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) {
      throw new Error("Crisis message not found");
    }
    return { id: messageDoc.id, ...messageDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch crisis message");
  }
};

// Update a crisis message
export const updateCrisisMessage = async (id, updatedData) => {
  try {
    const { contact, email, firstName, lastName, message } = updatedData;
    if (!contact || !email || !firstName || !lastName || !message) {
      throw new Error("Contact, email, firstName, lastName, and message are required");
    }

    const messageRef = doc(db, "crisis_messages", id);
    await updateDoc(messageRef, {
      contact,
      email,
      firstName,
      lastName,
      message,
      updatedAt: new Date().toISOString()
    });

    return { id, contact, email, firstName, lastName, message };
  } catch (error) {
    throw new Error(error.message || "Failed to update crisis message");
  }
};

// Delete a crisis message
export const deleteCrisisMessage = async (id) => {
  try {
    const messageRef = doc(db, "crisis_messages", id);
    await deleteDoc(messageRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete crisis message");
  }
};
