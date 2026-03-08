import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function buildPrompt(category: string, competitorList: string, depth: string) {
  const comps = competitorList.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const hasComp = comps.length > 0;
  const dims =
    depth === "deep"
      ? ["Onboarding", "Navigation", "Visual Design", "Key Interactions", "Info Architecture", "Accessibility"]
      : ["Onboarding", "Navigation", "Visual Design", "Key Interactions"];

  if (hasComp) {
    const eg = comps.map((c) => `"${c}":{"r":"Good","n":"5 words"}`).join(",");
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

function formatReportHtml(data: any): string {
  const hasC = data.comps && data.comps.length > 0;
  let tableRows = "";

  if (data.secs) {
    for (const sec of data.secs) {
      tableRows += `<tr><td colspan="${hasC ? data.comps.length + 3 : 4}" style="background:#0a0a0d;padding:8px 12px;font-family:monospace;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.1em">${sec.cat}</td></tr>`;
      for (const row of sec.rows || []) {
        if (hasC) {
          const cells = data.comps
            .map(
              (c: string) =>
                `<td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #222">${row.sc?.[c]?.r || "—"}</td>`
            )
            .join("");
          tableRows += `<tr><td style="padding:10px 12px;font-size:11px;color:#666;font-weight:600">${row.dim}</td>${cells}<td style="padding:10px 12px;font-size:12px;color:#8a8a98">${row.ins || ""}</td><td style="padding:10px 12px;font-size:12px;color:#a89ef5">${row.rec || ""}</td></tr>`;
        } else {
          tableRows += `<tr><td style="padding:10px 12px;font-size:11px;color:#666">${row.dim}</td><td style="padding:10px 12px;font-size:12px">${row.find || ""}</td><td style="padding:10px 12px">${row.r || ""}</td><td style="padding:10px 12px;color:#a89ef5">${row.rec || ""}</td></tr>`;
        }
      }
    }
  }

  const headerCells = hasC
    ? `<th style="padding:12px;font-size:10px;color:#e8ff47;text-align:left">${(data.comps || []).join("</th><th style=\"padding:12px;font-size:10px;color:#e8ff47;text-align:left\">")}</th><th style="padding:12px;font-size:10px;color:#7c6dfa">Key Insight</th><th style="padding:12px;font-size:10px;color:#7c6dfa">Your Move</th>`
    : `<th style="padding:12px;font-size:10px">Current Pattern</th><th style="padding:12px;font-size:10px">Rating</th><th style="padding:12px;font-size:10px;color:#7c6dfa">Your Move</th>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>UX Report</title></head>
<body style="margin:0;padding:24px;font-family:system-ui,-apple-system,sans-serif;background:#090909;color:#efefef">
  <div style="max-width:800px;margin:0 auto">
    <h1 style="font-size:24px;margin-bottom:8px">UX Rival Report</h1>
    ${data.headline ? `<p style="font-size:18px;font-weight:700;border-left:3px solid #e8ff47;padding:12px 16px;background:#101012;margin-bottom:16px">${data.headline}</p>` : ""}
    ${data.sum ? `<p style="font-size:14px;color:#b0b0bc;line-height:1.6;margin-bottom:24px"><strong>Overview —</strong> ${data.sum}</p>` : ""}
    <table style="width:100%;border-collapse:collapse;border:1px solid #212126;border-radius:8px;overflow:hidden">
      <thead style="background:#0c0c0e">
        <tr>
          <th style="padding:12px;font-size:10px;color:#666;text-align:left">Dimension</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    ${data.opp ? `<div style="margin-top:16px;padding:14px 20px;background:rgba(232,255,71,0.07);border-top:1px solid rgba(232,255,71,0.1)"><span style="font-size:9px;color:#e8ff47;letter-spacing:0.1em">GAP</span><p style="margin:4px 0 0;font-size:13px;color:#c8d87a">${data.opp}</p></div>` : ""}
    <p style="margin-top:32px;font-size:11px;color:#3a3a42;font-family:monospace">Generated by UXRival.com — Free AI UX Analysis</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, category, competitors, depth, frequency } = await req.json();

    if (!email || !category) {
      return NextResponse.json({ error: "email and category required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const res = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ role: "user", parts: [{ text: buildPrompt(category, competitors || "", depth || "quick") }] }],
    });

    const raw = res.text || "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 });
    }

    const data = JSON.parse(raw.slice(start, end + 1));
    const html = formatReportHtml(data);

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "UX Rival <onboarding@resend.dev>",
      to: email,
      subject: `UX Report: ${category}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Watchlist send error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
