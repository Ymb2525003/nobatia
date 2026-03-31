import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyq9Dvw7dxOhSznK8sjBYoiXMUSohkzBo",
  authDomain: "rice-and-milk.firebaseapp.com",
  projectId: "rice-and-milk",
  storageBucket: "rice-and-milk.firebasestorage.app",
  messagingSenderId: "652588172284",
  appId: "1:652588172284:web:9683bb69b248091146e879"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (!app.options.authDomain || !app.options.projectId) {
  console.warn('Firebase initialization warning: missing authDomain or projectId', app.options);
} else {
  console.log('Firebase initialized:', {
    projectId: app.options.projectId,
    authDomain: app.options.authDomain,
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);