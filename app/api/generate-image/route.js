"use server"
// app/api/generate-image/route.js
import { Configuration, OpenAIApi } from 'openai';
import { NextResponse } from 'next/server';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data.data[0].url;
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
