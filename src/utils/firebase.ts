// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAoRQ1wjvc7BtZKRV0k330ic4Cu-B-EOGM",
    authDomain: "responsi2-1dd78.firebaseapp.com",
    projectId: "responsi2-1dd78",
    storageBucket: "responsi2-1dd78.firebasestorage.app",
    messagingSenderId: "822938431434",
    appId: "1:822938431434:web:34d8bedc665ac784e26933",
    measurementId: "G-P6YZL1VYVH"
  };

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export { auth, googleProvider,db };