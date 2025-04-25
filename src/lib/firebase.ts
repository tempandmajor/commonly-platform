
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYaHzkXwI-_8on99Y3BqrhRqUvtsQ9nXI",
  authDomain: "commonly-platform.firebaseapp.com",
  projectId: "commonly-platform",
  storageBucket: "commonly-platform.appspot.com",
  messagingSenderId: "959082427909",
  appId: "1:959082427909:web:e92d0f48e27b3382a50e6c",
  measurementId: "G-S63E4DMQ8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Connect to Functions emulator when in development
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { app, db, storage, analytics, auth, functions, googleProvider };
