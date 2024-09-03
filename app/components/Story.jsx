"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { storage, auth } from "../lib/firebase";
import { ref, uploadString, getDownloadURL, listAll } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const Story = () => {
  const [story, setStory] = useState("");
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadPreviousImages(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadPreviousImages = async (userId) => {
    const storageRef = ref(storage, `images/${userId}`);
    const imageRefs = await listAll(storageRef);
    const urls = await Promise.all(
      imageRefs.items.map((itemRef) => getDownloadURL(itemRef))
    );
    setImages(urls);
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You need to log in to generate images.");
      return;
    }

    const prompts = analyzeStory(story);

    const generatedImages = [];
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      executeGeneration(prompt);
      async function executeGeneration(thePrompt) {
        const response = await axios.post("/api/generate-image", { thePrompt });
        console.log(response.data);
        
        const imageUrl = response.data.imageUrl;

        // Save image to Firebase Storage
        const imageRef = ref(
          storage,
          `images/${user.uid}/${Date.now()}_${i}.jpg`
        );
        await uploadString(imageRef, imageUrl, "data_url");

        const downloadUrl = await getDownloadURL(imageRef);
        generatedImages.push(downloadUrl);
      }
    }

    setImages([...images, ...generatedImages]);
  };

  const analyzeStory = (story) => {
    return story.split(". ").map((sentence) => sentence.trim());
  };

  return (
    <div>
      <form onSubmit={handleStorySubmit}>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full h-40 p-2 border rounded"
          placeholder="Write your story here..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 mt-4 rounded"
        >
          Generate Images
        </button>
      </form>
      <div className="mt-10">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Generated Image ${index + 1}`}
            className="w-full h-auto mt-4"
          />
        ))}
      </div>
    </div>
  );
};

export default Story;
