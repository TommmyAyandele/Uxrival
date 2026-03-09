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

    // Models to try in order of preference
    const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
    let response;
    let text;
    let lastError;

    for (const modelName of models) {
      try {
        console.log("Trying model:", modelName);
        
        // Try the current model with one retry
        let attempt = 1;
        while (attempt <= 2) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            text = response.text || "No response generated.";
            
            // If successful, break out of both loops
            if (text && text !== "No response generated.") {
              console.log("Success with model:", modelName);
              break;
            }
          } catch (err: any) {
            console.error(`Model ${modelName} attempt ${attempt} failed:`, err.message);
            lastError = err.message;
            
            // If it's a retryable error (503 or 429) and we have attempts left
            if (attempt < 2 && (err.message?.includes('503') || err.message?.includes('429'))) {
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              // Non-retryable error or no attempts left, break to try next model
              break;
            }
          }
          
          attempt++;
        }
        
        // If we got a successful response, break out of model loop
        if (response && text && text !== "No response generated.") {
          break;
        }
      } catch (err: any) {
        console.error(`Model ${modelName} completely failed:`, err.message);
        lastError = err.message;
      }
    }

    if (!response || !text || text === "No response generated.") {
      return NextResponse.json({ 
        error: "Our AI is experiencing high demand right now. Please try again in a minute." 
      }, { 
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