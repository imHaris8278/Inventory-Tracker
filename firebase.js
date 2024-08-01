import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz7qcdBn1pKi8hZMIdccIXw2b7-bLtPl4",
  authDomain: "pantry-tracker-a89c7.firebaseapp.com",
  projectId: "pantry-tracker-a89c7",
  storageBucket: "pantry-tracker-a89c7.appspot.com",
  messagingSenderId: "682885620787",
  appId: "1:682885620787:web:7f89f66f44878fc642ef46",
  measurementId: "G-WXFW4339RE",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
