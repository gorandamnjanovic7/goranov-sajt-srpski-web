import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// NOVO: Importujemo modul za logovanje
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDKR7dyv4tLlUgZn8axQ4ObNV8qxTpFEBY",
  authDomain: "ai-tools-pro-smart.firebaseapp.com",
  projectId: "ai-tools-pro-smart",
  storageBucket: "ai-tools-pro-smart.firebasestorage.app",
  messagingSenderId: "687827358510",
  appId: "1:687827358510:web:8e046b604005fac5b9e0bf",
  measurementId: "G-B6XYNNT6HB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// NOVO: Izvozimo funkcije za logovanje kako bismo ih koristili u App.jsx
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();