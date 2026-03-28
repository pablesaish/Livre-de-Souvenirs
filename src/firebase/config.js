import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqewTTyCAR9Ae4lXI6I6pz6daXc_bR5ME",
  authDomain: "dsecapstone.firebaseapp.com",
  projectId: "dsecapstone",
  storageBucket: "dsecapstone.firebasestorage.app",
  messagingSenderId: "325293093829",
  appId: "1:325293093829:web:38b946ccd1f9c3a0a5d1ac",
  measurementId: "G-P6YJG2XMLT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
