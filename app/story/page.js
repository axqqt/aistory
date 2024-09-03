import { useState } from 'react';
import axios from 'axios';

const Story = () => {
  const [story, setStory] = useState('');
  const [images, setImages] = useState([]);

  const handleStorySubmit = async (e) => {
    e.preventDefault();

    const prompts = analyzeStory(story); // Function to break story into prompts

    const generatedImages = [];
    for (let prompt of prompts) {
      const response = await axios.post('/api/generate-image', { prompt });
      generatedImages.push(response.data.imageUrl);
    }

    setImages(generatedImages);
  };

  const analyzeStory = (story) => {
    // Dummy implementation to break down story into smaller prompts
    return story.split('. ').map(sentence => sentence.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <form onSubmit={handleStorySubmit} className="w-full max-w-lg mt-10">
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
          <img key={index} src={url} alt={`Generated Image ${index + 1}`} className="w-full h-auto mt-4" />
        ))}
      </div>
    </div>
  );
};

export default Story;
