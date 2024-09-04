"use client";
import { useEffect, useState } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

export default function Home() {
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('Realistic');
  const [credits, setCredits] = useState(10);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const response = await axios.post('/api/image-gen', {
        prompt,
        size,
        style,
      });
      
      setImages(response.data.Outcome);
      setCredits(credits - 1); // Deduct one credit per generation
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.displayName}</h1>
          <div className="my-4">
            <label className="block mb-2">Art Style:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            >
              <option value="Realistic">Realistic</option>
              <option value="Abstract">Abstract</option>
              <option value="Anime">Anime</option>
              <option value="Sketch">Sketch</option>
              <option value="Oil Painting">Oil Painting</option>
              <option value="Watercolor">Watercolor</option>
            </select>
          </div>
          <div className="my-4">
            <label className="block mb-2">Image Size:</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            >
              <option value="1024x1024">1024x1024</option>
              <option value="512x512">512x512</option>
            </select>
          </div>
          <div className="my-4">
            <label className="block mb-2">Story Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border w-full px-2 py-1 rounded"
              rows="4"
              placeholder="Enter your story prompt here..."
            ></textarea>
          </div>
          <div className="my-4">
            <button
              className={`text-white px-4 py-2 rounded ${
                isLoading || credits <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={handleGenerateImages}
              disabled={isLoading || credits <= 0}
            >
              {isLoading ? 'Generating...' : `Generate Images (Credits Left: ${credits})`}
            </button>
          </div>
          <div className="my-4">
            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="border p-4 rounded shadow-md">
                    <div 
                      dangerouslySetInnerHTML={{ __html: image.highlightedPrompt }}
                      className="mb-2 font-semibold"
                    ></div>
                    <img 
                      src={image.imageUrl} 
                      alt={`Generated image ${index + 1}`} 
                      className="w-full h-auto rounded"
                    />
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