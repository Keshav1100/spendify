// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfE0FzzeEIvR6IHd38wXpz54ATrFiTyuM",
  authDomain: "spendify-expense-tracker.firebaseapp.com",
  projectId: "spendify-expense-tracker",
  storageBucket: "spendify-expense-tracker.firebasestorage.app",
  messagingSenderId: "1033051389386",
  appId: "1:1033051389386:web:db9ff581aa7dbbd6e3a333",
  measurementId: "G-3QZWNFHGFH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const analytics = getAnalytics(app);

// db
export const firestore = getFirestore(app);
