"use client"
import { useEffect, useState } from 'react';
import { auth,signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Story from './components/Story';


export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {!user ? (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <h1 className="text-2xl">Welcome, {user.displayName}</h1>
          <img
            src={
              user?.photoURL ||
              "https://media.istockphoto.com/id/1393750072/vector/flat-white-icon-man-for-web-design-silhouette-flat-illustration-vector-illustration-stock.jpg?s=612x612&w=0&k=20&c=s9hO4SpyvrDIfELozPpiB_WtzQV9KhoMUP9R9gVohoU="
            }
            alt="User Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
          <Story/>
        </div>
      )}
    </div>
  );
}
