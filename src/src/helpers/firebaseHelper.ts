// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import app from "../config/database/firsebase";

const storage = getStorage(app);

interface File {
  originalname: string;
  buffer: Buffer;
}

const firebaseHelper = {
  /**
   * Uploads a video to Firebase Storage.
   * @param {File} videoFile - The video file to upload.
   * @return {Promise<string>} - The download URL of the uploaded video.
   */
  uploadVideo: async (videoFile: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${videoFile.originalname}`;
      const storageRef = ref(storage, `lesson/${fileName}`);
      await uploadBytes(storageRef, videoFile.buffer);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Firebase Error uploading video:", error);
      throw new Error("Server failed");
    }
  },

  /**
   * Uploads a file to Firebase Storage.
   * @param {File} file - The file to upload.
   * @return {Promise<string>} - The download URL of the uploaded file.
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.originalname}`;
      const storageRef = ref(storage, `file/${fileName}`);
      await uploadBytes(storageRef, file.buffer);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Firebase Error uploading file:", error);
      throw new Error("Server failed");
    }
  },

  /**
   * Deletes a file from Firebase Storage.
   * @param {string} fileLink - The Firebase storage path to the file.
   */
  deleteFile: async (fileLink: string): Promise<void> => {
    const fileRef = ref(storage, fileLink);
    try {
      await deleteObject(fileRef);
      console.log(`Deleted file: ${fileLink}`);
    } catch (error) {
      console.error(`Failed to delete file from Firebase: ${(error as Error).message}`);
    }
  },

  /**
   * Uploads a course avatar to Firebase Storage.
   * @param {File} pictureFile - The picture file to upload.
   * @return {Promise<string>} - The download URL of the uploaded avatar.
   */
  uploadAvatarCourse: async (pictureFile: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${pictureFile.originalname}`;
      const storageRef = ref(storage, `Course_Avatar/${fileName}`);
      await uploadBytes(storageRef, pictureFile.buffer);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Firebase Error uploading avatar:", error);
      throw new Error("Server failed");
    }
  },
};

export default firebaseHelper;
