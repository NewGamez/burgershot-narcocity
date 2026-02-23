import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCt1kjVbZv14DowsP-jw0zWbac1B-bAjl0",
  authDomain: "burgershot-intern-f23c7.firebaseapp.com",
  projectId: "burgershot-intern-f23c7",
  storageBucket: "burgershot-intern-f23c7.firebasestorage.app",
  messagingSenderId: "489405373322",
  appId: "1:489405373322:web:e9ab1948b6f6cbc1f30673"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
