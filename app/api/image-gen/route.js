"use server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

export async function POST(req) {
  const { prompt, size, style } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Use Gemini to break down the story into smaller prompts
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`Break down the following story into 3-5 key scenes, each described in a single sentence: ${prompt}`);
    const smallerPrompts = JSON.parse(result.response.text());

    const imageResponses = [];

    // Generate images for each smaller prompt using Stable Diffusion
    for (const smallPrompt of smallerPrompts) {
      const response = await axios.post(
        STABILITY_API_URL,
        {
          text_prompts: [
            {
              text: `${smallPrompt} in ${style} style`,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: size === "1024x1024" ? 1024 : 512,
          width: size === "1024x1024" ? 1024 : 512,
          samples: 1,
          steps: 30
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${STABILITY_API_KEY}`,
          },
          responseType: 'arraybuffer'
        }
      );

      if (response.status === 200) {
        // Convert the image buffer to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        imageResponses.push({
          prompt: smallPrompt,
          imageUrl,
        });
      } else {
        throw new Error(`Non-200 response: ${response.status}`);
      }
    }

    const Outcome = smallerPrompts.map((smallPrompt, index) => ({
      highlightedPrompt: `<strong>${smallPrompt}</strong>`,
      imageUrl: imageResponses[index].imageUrl,
    }));

    return NextResponse.json({ Outcome }, { status: 200 });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}