import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using the current 2026 stable-preview model ID
    let attempt = 1;
    let response;
    let text;

    while (attempt <= 3) {
      try {
        console.log(`Retrying Gemini... attempt ${attempt}`);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        text = response.text || "No response generated.";
        
        // If successful, break the retry loop
        break;
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err.message);
        
        // Check if it's a retryable error (503 or 429)
        if (attempt < 3 && (err.message?.includes('503') || err.message?.includes('429'))) {
          // Wait 3 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          // Non-retryable error, break the loop
          break;
        }
      }
      
      attempt++;
    }

    if (!response) {
      return NextResponse.json({ error: "Failed after 3 attempts" }, { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    return NextResponse.json({ text }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (err: any) {
    console.error("SDK ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
}