import { db } from "../config/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { getUserById } from "./usersServices.js"; // ✅ import user service

// ✅ Add a new activity log
export const addUserActivityLog = async (logData) => {
  try {
    const { action, details, timestamp, userId } = logData;

    if (!action || !details || !userId) {
      throw new Error("action, details, and userId are required");
    }

    const logsRef = await addDoc(collection(db, "user_activity_logs"), {
      action,
      details,
      timestamp: timestamp || new Date().toISOString(),
      userId,
    });

    return { id: logsRef.id, action, details, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to add user activity log");
  }
};

// ✅ Get all logs + user data
export const getAllUserActivityLogs = async () => {
  try {
    const logsRef = collection(db, "user_activity_logs");
    const querySnapshot = await getDocs(logsRef);

    const logs = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const logData = { id: docSnap.id, ...docSnap.data() };

        // ✅ Fetch related user data
        try {
          const user = await getUserById(logData.userId);
          return { ...logData, user };
        } catch {
          return { ...logData, user: null }; // if user missing
        }
      })
    );

    return logs;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user activity logs");
  }
};

// ✅ Get logs by user ID + user data
export const getUserLogsById = async (userId) => {
  try {
    const logsRef = collection(db, "user_activity_logs");
    const q = query(logsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // ✅ Get user once
    const user = await getUserById(userId);

    // Combine user data with each log
    return logs.map((log) => ({ ...log, user }));
  } catch (error) {
    throw new Error(error.message || "Failed to fetch logs by user ID");
  }
};

// ✅ Get single log by document ID + user data
export const getUserActivityLogById = async (id) => {
  try {
    const logRef = doc(db, "user_activity_logs", id);
    const logDoc = await getDoc(logRef);

    if (!logDoc.exists()) throw new Error("Activity log not found");

    const logData = { id: logDoc.id, ...logDoc.data() };

    // ✅ Fetch user data
    const user = await getUserById(logData.userId);
    return { ...logData, user };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch activity log");
  }
};

// ✅ Update a log
export const updateUserActivityLog = async (id, updatedData) => {
  try {
    const { action, details, userId } = updatedData;
    if (!action || !details || !userId) {
      throw new Error("action, details, and userId are required");
    }

    const logRef = doc(db, "user_activity_logs", id);
    await updateDoc(logRef, {
      action,
      details,
      userId,
      updatedAt: new Date().toISOString(),
    });

    return { id, action, details, userId };
  } catch (error) {
    throw new Error(error.message || "Failed to update activity log");
  }
};

// ✅ Delete a log
export const deleteUserActivityLog = async (id) => {
  try {
    const logRef = doc(db, "user_activity_logs", id);
    await deleteDoc(logRef);
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete activity log");
  }
};
