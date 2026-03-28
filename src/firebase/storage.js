import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image file to Firebase Storage.
 * @param {File} file
 * @param {string} path - e.g., "journal/userId/2026-03-28.jpg"
 * @param {function} onProgress - callback(percent)
 * @returns {Promise<string>} download URL
 */
export const uploadImage = (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

/**
 * Upload a Blob (e.g., cropped canvas) to Firebase Storage.
 */
export const uploadBlob = async (blob, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytesResumable(storageRef, blob);
  return getDownloadURL(snapshot.ref);
};

/**
 * Delete an image from Firebase Storage.
 */
export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
