"use server"
// app/api/generate-image/route.js
import { Configuration, OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAI(configuration);

export async function POST(req) {
  const { prompt, size } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Function to split the full story prompt into smaller prompts
    const splitPrompts = (fullPrompt) => {
      // For simplicity, split by sentence. You can modify this to use other criteria.
      return fullPrompt.split('. ').map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
    };

    const smallerPrompts = splitPrompts(prompt);
    const imageResponses = [];

    for (const smallPrompt of smallerPrompts) {
      const response = await openai.createImage({
        prompt: smallPrompt,
        n: 1,
        size: size || '1024x1024',
      });

      const imageUrl = response.data.data[0].url;
      imageResponses.push({
        prompt: smallPrompt,
        imageUrl: imageUrl,
      });
    }

    // Format the final response with highlighted prompts and images
    const result = smallerPrompts.map((smallPrompt, index) => ({
      highlightedPrompt: `<strong>${smallPrompt}</strong>`,
      imageUrl: imageResponses[index].imageUrl,
    }));

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
