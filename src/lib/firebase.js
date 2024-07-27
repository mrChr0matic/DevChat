import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-aee58.firebaseapp.com",
  projectId: "reactchat-aee58",
  storageBucket: "reactchat-aee58.appspot.com",
  messagingSenderId: "1012361694297",
  appId: "1:1012361694297:web:74b38ee13b32ec91933548"
};
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore();
export const storage=getStorage();