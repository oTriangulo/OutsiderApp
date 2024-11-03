// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbYuJzlc7KHciE-SBEo9EbB8nMqO1ljjo",
  authDomain: "outsiderapp-7d501.firebaseapp.com",
  projectId: "outsiderapp-7d501",
  storageBucket: "outsiderapp-7d501.appspot.com",
  messagingSenderId: "98384150370",
  appId: "1:98384150370:web:5f0aa4e9c25ca18691363b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };