import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHxd3TGf8v9DVUevw6p5F47EBV7ihYTuk",
  authDomain: "xscard-addd4.firebaseapp.com", 
  projectId: "xscard-addd4",
  storageBucket: "xscard-addd4.firebasestorage.app",
  messagingSenderId: "628567737496",
  appId: "NEED_FROM_CONSOLE" // ⚠️ Missing from console - add this from Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export the app instance for other services if needed
export default app; 