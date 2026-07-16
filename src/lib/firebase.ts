import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCHlE79Jrjrtz7dmE5QJ4RhMN6HCzi0QPc",
  authDomain: "abstracta-app.firebaseapp.com",
  databaseURL: "https://abstracta-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "abstracta-app",
  storageBucket: "abstracta-app.firebasestorage.app",
  messagingSenderId: "454008648030",
  appId: "1:454008648030:web:4704e6df5260ea0846dfcf"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
