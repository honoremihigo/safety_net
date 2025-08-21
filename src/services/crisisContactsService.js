import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Add a new crisis contact
export const addCrisisContact = async (contactData) => {
  try {
    const { description, name, phone } = contactData;
    if (!description || !name || !phone) {
      throw new Error("Description, name, and phone are required");
    }

    const contactRef = await addDoc(collection(db, "crisis_contacts"), {
      description,
      name,
      phone,
      createdAt: new Date().toISOString()
    });

    return { id: contactRef.id, description, name, phone };
  } catch (error) {
    throw new Error(error.message || "Failed to add crisis contact");
  }
};

// Get all crisis contacts
export const getAllCrisisContacts = async () => {
  try {
    const contactsRef = collection(db, "crisis_contacts");
    const querySnapshot = await getDocs(contactsRef);
    const contacts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return contacts;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch crisis contacts");
  }
};

// Get a single crisis contact by ID
export const getCrisisContactById = async (id) => {
  try {
    const contactRef = doc(db, "crisis_contacts", id);
    const contactDoc = await getDoc(contactRef);
    if (!contactDoc.exists()) {
      throw new Error("Crisis contact not found");
    }
    return { id: contactDoc.id, ...contactDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch crisis contact");
  }
};

// Update a crisis contact
export const updateCrisisContact = async (id, updatedData) => {
  try {
    const { description, name, phone } = updatedData;
    if (!description || !name || !phone) {
      throw new Error("Description, name, and phone are required");
    }

    const contactRef = doc(db, "crisis_contacts", id);
    await updateDoc(contactRef, {
      description,
      name,
      phone,
      updatedAt: new Date().toISOString()
    });

    return { id, description, name, phone };
  } catch (error) {
    throw new Error(error.message || "Failed to update crisis contact");
  }
};

// Delete a crisis contact
export const deleteCrisisContact = async (id) => {
  try {
    const contactRef = doc(db, "crisis_contacts", id);
    await deleteDoc(contactRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete crisis contact");
  }
};
