"use client";
import { useEffect, useState } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

export default function Home() {
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('Realistic'); // Default style
  const [credits, setCredits] = useState(10); // Initialize with some credits
  const [images, setImages] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Fetch user credits from your backend or database here
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateImages = async () => {
    if (credits <= 0) {
      alert('You are out of credits. Please purchase more.');
      return;
    }

    try {
      const response = await axios.post('/api/generate-image', {
        prompt,
        size,
        style,
      });
      
      setImages(response.data.Outcome);
      setCredits(credits - 1); // Deduct one credit per image generation
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!user ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <div className="my-4">
            <label className="block">Art Style:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="Realistic">Realistic</option>
              <option value="Abstract">Abstract</option>
              <option value="Anime">Anime</option>
              <option value="Sketch">Sketch</option>
            </select>
          </div>
          <div className="my-4">
            <label className="block">Image Size:</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="1024x1024">1024x1024</option>
              <option value="512x512">512x512</option>
            </select>
          </div>
          <div className="my-4">
            <label className="block">Story Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border w-full px-2 py-1 rounded"
              rows="4"
            ></textarea>
          </div>
          <div className="my-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleGenerateImages}
              disabled={credits <= 0}
            >
              Generate Images (Credits Left: {credits})
            </button>
          </div>
          <div className="my-4">
            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div dangerouslySetInnerHTML={{ __html: image.highlightedPrompt }}></div>
                    <img src={image.imageUrl} alt={`Generated image ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
