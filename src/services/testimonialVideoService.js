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

// Add a new testimonial video
export const addTestimonialVideo = async (videoData) => {
  try {
    const videoRef = await addDoc(collection(db, "testmonial_video"), {
      title: videoData.title,
      video_link: videoData.video_link,
      timestamp: serverTimestamp()
    });

    return { id: videoRef.id, ...videoData };
  } catch (error) {
    throw new Error(error.message || "Failed to add testimonial video");
  }
};

// Get all testimonial videos
export const getAllTestimonialVideos = async () => {
  try {
    const videosRef = collection(db, "testmonial_video");
    const querySnapshot = await getDocs(videosRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message || "Failed to fetch testimonial videos");
  }
};

// Get a single testimonial video by ID
export const getTestimonialVideoById = async (id) => {
  try {
    const videoRef = doc(db, "testmonial_video", id);
    const videoDoc = await getDoc(videoRef);
    if (!videoDoc.exists()) {
      throw new Error("Testimonial video not found");
    }
    return { id: videoDoc.id, ...videoDoc.data() };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch testimonial video");
  }
};

// Update a testimonial video
export const updateTestimonialVideo = async (id, videoData) => {
  try {
    const videoRef = doc(db, "testmonial_video", id);
    await updateDoc(videoRef, {
      title: videoData.title,
      video_link: videoData.video_link,
      updatedAt: new Date().toISOString()
    });
    return { id, ...videoData };
  } catch (error) {
    throw new Error(error.message || "Failed to update testimonial video");
  }
};

// Delete a testimonial video
export const deleteTestimonialVideo = async (id) => {
  try {
    const videoRef = doc(db, "testmonial_video", id);
    await deleteDoc(videoRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete testimonial video");
  }
};
