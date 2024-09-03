import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCfj-o4h1Jp49iqREEHSdZZOE4DQRLCNjU",
    authDomain: "problems-33746.firebaseapp.com",
    projectId: "problems-33746",
    storageBucket: "problems-33746.appspot.com",
    messagingSenderId: "4637713392",
    appId: "1:4637713392:web:cb8de88019d96a132bf335",
    measurementId: "G-LCBEGTE3B2"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const signInWithGoogle = () => signInWithPopup(auth, provider);

export { auth, db, signInWithGoogle };
