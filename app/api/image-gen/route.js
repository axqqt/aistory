"use server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "node:fs";
import FormData from "form-data";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Stability AI API configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/ultra";

export async function POST(req) {
  const { prompt, size } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Use Gemini to break down the full story into smaller prompts
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(
      `Break down the following story into 3-5 key scenes, each described in a single sentence: ${prompt}`
    );

    // Check if the response contains the expected data
    if (!result.response || !result.response.text) {
      throw new Error("Unexpected response format from Gemini AI");
    }

    // Try parsing the result response text
    let smallerPrompts;
    try {
      smallerPrompts = JSON.parse(result.response.text());
    } catch (parseError) {
      console.error("Error parsing response from Gemini AI:", parseError);
      return NextResponse.json(
        { error: "Failed to parse response from AI" },
        { status: 500 }
      );
    }

    const imageResponses = [];

    // Generate images for each smaller prompt using Stability AI
    for (const smallPrompt of smallerPrompts) {
      const payload = {
        prompt: smallPrompt,
        output_format: "webp",
        size
      };

      try {
        const response = await axios.postForm(
          STABILITY_API_URL,
          axios.toFormData(payload, new FormData()),
          {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: { 
              Authorization: `Bearer ${STABILITY_API_KEY}`, 
              Accept: "image/*" 
            },
          },
        );

        if (response.status === 200) {
          const imageName = `./${smallPrompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
          fs.writeFileSync(imageName, Buffer.from(response.data));
          imageResponses.push({
            prompt: smallPrompt,
            imageUrl: imageName,
          });
        } else {
          console.error(`Failed to generate image: ${response.status}: ${response.data.toString()}`);
        }
      } catch (error) {
        console.error("Error generating image with Stability AI:", error);
      }
    }

    // Format the final response with highlighted prompts and images
    const Outcome = smallerPrompts.map((smallPrompt, index) => ({
      highlightedPrompt: `<strong>${smallPrompt}</strong>`,
      imageUrl: imageResponses[index]?.imageUrl || 'Image generation failed',
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
