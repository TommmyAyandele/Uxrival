import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function buildPrompt(category: string, competitorList: string, depth: string, focusAreas?: string) {
  const otherComps = competitorList.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const comps = otherComps.slice(0, 3);
  const hasComp = comps.length > 0;
  const focusDims = focusAreas?.trim()
    ? focusAreas.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    : null;
  const dims = focusDims && focusDims.length > 0
    ? focusDims
    : (depth === "deep"
        ? ["Onboarding", "Navigation", "Visual Design", "Key Interactions", "Info Architecture", "Accessibility"]
        : ["Onboarding", "Navigation", "Visual Design", "Key Interactions"]);
  
  if (hasComp) {
    const eg = comps.map(c => `"${c}":{"r":"Good","n":"5 words"}`).join(",");
    return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}". Compare: ${comps.join(", ")}.
Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = specific design action for someone building a new product in this space.

Schema:
{"headline":"single punchy sentence max 20 words summarizing biggest opportunity","sum":"brief summary","scores":{"CompetitorName":0-100 per competitor},"comps":${JSON.stringify(comps)},"secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","sc":{${eg}},"ins":"gap insight","rec":"your design recommendation"}]}],"opp":"market gap"}

Include "scores" object with overall UX score 0-100 per competitor. Topics (one section each, two rows per section): ${dims.join(", ")}.
JSON only:`;
  }

  return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}" category.
Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = one concrete design improvement a new product builder should implement.

Schema:
{"headline":"single punchy sentence max 20 words summarizing biggest opportunity","sum":"brief summary","category_score":0-100,"secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","find":"current pattern","r":"Good","rec":"design recommendation"}]}],"opp":"market gap"}

Include "category_score" with overall UX score 0-100 for the category. Topics (one section each, two rows per section): ${dims.join(", ")}.
JSON only:`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         
         'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining?: number; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 10 requests per minute." },
        { 
          status: 429,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": (rateLimit.resetTime ?? 0).toString(),
          }
        }
      );
    }

    const body = await req.json();
    const { category, competitors = [], depth = "quick", focusAreas } = body;

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
          }
        }
      );
    }

    const competitorList = Array.isArray(competitors) ? competitors.join(", ") : competitors;
    const prompt = buildPrompt(category, competitorList, depth, focusAreas);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API configuration error" },
        { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
          }
        }
      );
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
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        }
      });
    }

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Failed to process analysis response" },
        { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
          }
        }
      );
    }

    return NextResponse.json(analysisData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        "X-RateLimit-Limit": RATE_LIMIT.toString(),
        "X-RateLimit-Remaining": (rateLimit.remaining ?? 0).toString(),
        "X-RateLimit-Reset": (rateLimit.resetTime ?? 0).toString(),
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
