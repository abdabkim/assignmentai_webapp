import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDiqLqmiZDc_kIgHoC3JKEq2V31BNBaR_k",
  authDomain: "webdev-d1a20.firebaseapp.com",
  projectId: "webdev-d1a20",
  storageBucket: "webdev-d1a20.firebasestorage.app",
  messagingSenderId: "23584087197",
  appId: "1:23584087197:web:7360271f071da38b324874",
  measurementId: "G-6YHRMQ16E8",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
