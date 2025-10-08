import { db } from "../config/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

// Add a new crisis message
export const addCrisisMessage = async (messageData) => {
  try {
    const messageRef = await addDoc(collection(db, "crisis_messages"), {
      category: messageData.category,
      email: messageData.email,
      isAnonymous: messageData.isAnonymous,
      isUrgent: messageData.isUrgent,
      message: messageData.message,
      name: messageData.name,
      phone: messageData.phone,
      rating: messageData.rating,
      contact: messageData.contact || "",
      firstName: messageData.firstName || "",
      lastName: messageData.lastName || "",
      timestamp: serverTimestamp()
    });

    return { id: messageRef.id, ...messageData };
  } catch (error) {
    throw new Error(error.message || "Failed to add crisis message");
  }
};

// Get all crisis messages
export const getAllCrisisMessages = async () => {
  try {
    const messagesRef = collection(db, "crisis_messages");
    const querySnapshot = await getDocs(messagesRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
export const updateCrisisMessage = async (id, messageData) => {
  try {
    const messageRef = doc(db, "crisis_messages", id);
    await updateDoc(messageRef, {
      category: messageData.category,
      email: messageData.email,
      isAnonymous: messageData.isAnonymous,
      isUrgent: messageData.isUrgent,
      message: messageData.message,
      name: messageData.name,
      phone: messageData.phone,
      rating: messageData.rating,
      contact: messageData.contact || "",
      firstName: messageData.firstName || "",
      lastName: messageData.lastName || "",
      updatedAt: new Date().toISOString()
    });
    return { id, ...messageData };
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
