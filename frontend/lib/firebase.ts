import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBs5GnW3JBnj-HJIUOgXDmZw_IMPA-3qVw",
  authDomain: "roomlenseai.firebaseapp.com",
  projectId: "roomlenseai",
  storageBucket: "roomlenseai.firebasestorage.app",
  messagingSenderId: "463819421602",
  appId: "1:463819421602:web:186977427798f6a98764fb",
  measurementId: "G-RZM879QQ6C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);