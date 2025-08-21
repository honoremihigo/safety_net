import { db } from "../config/firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getUserById } from "./usersServices"; // <-- assuming your user service is saved as userService.js

// Add a new testimonial
export const addTestimonial = async (testimonialData) => {
  try {
    const { content, name, rating, userId } = testimonialData;
    if (!content || !name || rating === undefined || !userId) {
      throw new Error("Content, name, rating, and userId are required");
    }

    const testimonialRef = await addDoc(collection(db, "testimonials"), {
      content,
      name,
      rating,
      userId,
      timestamp: serverTimestamp()
    });

    return { id: testimonialRef.id, content, name, rating, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to add testimonial");
  }
};

// Get all testimonials (with user relation)
export const getAllTestimonials = async () => {
  try {
    const testimonialsRef = collection(db, "testimonials");
    const querySnapshot = await getDocs(testimonialsRef);

    const testimonials = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const testimonial = { id: docSnap.id, ...docSnap.data() };

        // fetch related user if exists
        let user = null;
        if (testimonial.userId) {
          try {
            user = await getUserById(testimonial.userId);
          } catch {
            user = null; // user might be deleted
          }
        }

        return { ...testimonial, user };
      })
    );

    return testimonials;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch testimonials");
  }
};

// Get a single testimonial by ID (with user relation)
export const getTestimonialById = async (id) => {
  try {
    const testimonialRef = doc(db, "testimonials", id);
    const testimonialDoc = await getDoc(testimonialRef);

    if (!testimonialDoc.exists()) {
      throw new Error("Testimonial not found");
    }

    const testimonial = { id: testimonialDoc.id, ...testimonialDoc.data() };

    // fetch related user
    let user = null;
    if (testimonial.userId) {
      try {
        user = await getUserById(testimonial.userId);
      } catch {
        user = null;
      }
    }

    return { ...testimonial, user };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch testimonial");
  }
};

// Update a testimonial
export const updateTestimonial = async (id, updatedData) => {
  try {
    const { content, name, rating, userId } = updatedData;
    if (!content || !name || rating === undefined || !userId) {
      throw new Error("Content, name, rating, and userId are required");
    }

    const testimonialRef = doc(db, "testimonials", id);
    await updateDoc(testimonialRef, {
      content,
      name,
      rating,
      userId,
      updatedAt: new Date().toISOString()
    });

    return { id, content, name, rating, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to update testimonial");
  }
};

// Delete a testimonial
export const deleteTestimonial = async (id) => {
  try {
    const testimonialRef = doc(db, "testimonials", id);
    await deleteDoc(testimonialRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete testimonial");
  }
};
