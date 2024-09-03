import { useEffect, useState } from 'react';
import { auth, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
        </div>
      )}
    </div>
  );
}
