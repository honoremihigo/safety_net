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

// Add a new therapy booking
export const addTherapyBooking = async (bookingData) => {
  try {
    const bookingRef = await addDoc(collection(db, "therapy_bookings"), {
      date: bookingData.date,
      duration: bookingData.duration,
      email: bookingData.email,
      isUrgent: bookingData.isUrgent,
      name: bookingData.name,
      notes: bookingData.notes,
      phone: bookingData.phone,
      service: bookingData.service,
      status: bookingData.status,
      therapist: bookingData.therapist,
      time: bookingData.time,
      timestamp: serverTimestamp()
    });

    return { id: bookingRef.id, ...bookingData };
  } catch (error) {
    throw new Error(error.message || "Failed to add therapy booking");
  }
};

// Get all therapy bookings
export const getAllTherapyBookings = async () => {
  try {
    const bookingsRef = collection(db, "therapy_bookings");
    const querySnapshot = await getDocs(bookingsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message || "Failed to fetch therapy bookings");
  }
};

// Get a single therapy booking by ID
export const getTherapyBookingById = async (id) => {
  try {
    const bookingRef = doc(db, "therapy_bookings", id);
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error("Therapy booking not found");
    }
    return { id: bookingDoc.id, ...bookingDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch therapy booking");
  }
};

// Update a therapy booking
export const updateTherapyBooking = async (id, bookingData) => {
  try {
    const bookingRef = doc(db, "therapy_bookings", id);
    await updateDoc(bookingRef, {
      date: bookingData.date,
      duration: bookingData.duration,
      email: bookingData.email,
      isUrgent: bookingData.isUrgent,
      name: bookingData.name,
      notes: bookingData.notes,
      phone: bookingData.phone,
      service: bookingData.service,
      status: bookingData.status,
      therapist: bookingData.therapist,
      time: bookingData.time,
      updatedAt: new Date().toISOString()
    });
    return { id, ...bookingData };
  } catch (error) {
    throw new Error(error.message || "Failed to update therapy booking");
  }
};

// Delete a therapy booking
export const deleteTherapyBooking = async (id) => {
  try {
    const bookingRef = doc(db, "therapy_bookings", id);
    await deleteDoc(bookingRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete therapy booking");
  }
};
