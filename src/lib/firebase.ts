
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYaHzkXwI-_8on99Y3BqrhRqUvtsQ9nXI",
  authDomain: "commonly-platform.firebaseapp.com",
  projectId: "commonly-platform",
  storageBucket: "commonly-platform.firebasestorage.app",
  messagingSenderId: "959082427909",
  appId: "1:959082427909:web:e92d0f48e27b3382a50e6c",
  measurementId: "G-S63E4DMQ8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, db, storage, analytics };
