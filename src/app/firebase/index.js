
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBHsw1VYAX5ZyH0Jrbd6njDbcxuoH2Nv_w",
  authDomain: "talent-884db.firebaseapp.com",
  projectId: "talent-884db",
  storageBucket: "talent-884db.appspot.com",
  messagingSenderId: "568498800529",
  appId: "1:568498800529:web:b08741eddb5b4cdfff7c30"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const db = getFirestore(app);
const storage = getStorage(app);


export {auth, db, storage}