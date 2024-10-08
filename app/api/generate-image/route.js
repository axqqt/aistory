"use server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1/generations";

export async function POST(req) {
  const { prompt, size, style } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`Break down the following story into 3-5 key scenes, each described in a single sentence: ${prompt}`);
    const smallerPrompts = JSON.parse(result.response.text());

    const imageResponses = [];

    for (const smallPrompt of smallerPrompts) {
      const response = await axios.post(
        LEONARDO_API_URL,
        {
          prompt: `${smallPrompt} in ${style} style`,
          num_images: 1,
          width: size === "1024x1024" ? 1024 : 512,
          height: size === "1024x1024" ? 1024 : 512,
        },
        {
          headers: {
            Authorization: `Bearer ${LEONARDO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const imageUrl = response.data.generations[0].image_url;
      imageResponses.push({
        prompt: smallPrompt,
        imageUrl,
      });
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
