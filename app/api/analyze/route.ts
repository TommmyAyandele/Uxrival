import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
try {
const { prompt } = await req.json();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  return NextResponse.json({ error: "API Key missing" }, { status: 500 });
}

const ai = new GoogleGenAI({ apiKey });

// Using the current 2026 stable-preview model ID
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite-preview",
  contents: [{ role: "user", parts: [{ text: prompt }] }],
});

const text = response.text || "No response generated.";
return NextResponse.json({ text });
} catch (err: any) {
console.error("SDK ERROR:", err.message);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}