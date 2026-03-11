import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function formatReportHtml(data: any): string {
  const hasC = data.comps && data.comps.length > 0;
  
  // Header
  const header = `
    <div style="background:#0a0a0a;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.03em;">UX</span>
        <span style="color:#e8ff47;font-size:20px;font-weight:800;letter-spacing:-0.03em;">Rival</span>
      </div>
      <div style="background:#e8ff47;color:#0a0a0a;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border:2px solid #0a0a0a;">
        AI UX REPORT
      </div>
    </div>
  `;
  
  // Headline band
  const headline = data.headline ? `
    <div style="background:#111111;padding:24px;border-left:3px solid #e8ff47;">
      <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 8px 0;line-height:1.4;">${data.headline}</h2>
      ${data.sum ? `<p style="color:#888888;font-size:13px;margin:0;line-height:1.5;">${data.sum}</p>` : ''}
    </div>
    ` : '';
  
  // Score cards
  const scoreCards = hasC ? `
    <div style="background:#ffffff;padding:16px 24px;text-align:center;">
      ${data.comps.map((comp: string) => {
        const score = data.scores?.[comp] || 0;
        const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';
        const ratingWord = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';
        return `
          <div style="border:1px solid #eeeeee;border-radius:10px;padding:14px 18px;text-align:center;display:inline-block;min-width:120px;margin:4px;vertical-align:top;">
            <div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${comp}</div>
            <div style="font-size:36px;font-weight:700;color:${scoreColor};margin-bottom:4px;">${score}</div>
            <div style="font-size:11px;color:${scoreColor};font-weight:600;">${ratingWord}</div>
          </div>
        `;
      }).join('')}
    </div>
    ` : '';
  
  // Table
  let tableRows = '';
  let tableHeaders = '';
  
  if (data.secs) {
    // Build table headers with actual competitor names
    tableHeaders = `
      <tr style="background:#f5f5f5;">
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;color:#666666;text-align:left;font-weight:600;">DIMENSION</th>
        ${hasC ? data.comps.map((comp: string) => `<th style="padding:10px 12px;font-size:11px;text-transform:uppercase;color:#666666;text-align:left;font-weight:600;">${comp}</th>`).join('') : ''}
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;color:#666666;text-align:left;font-weight:600;">KEY INSIGHT</th>
        <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;color:#666666;text-align:left;font-weight:600;">YOUR MOVE</th>
      </tr>
    `;
    
    for (const sec of data.secs) {
      // Section header row
      tableRows += `
        <tr style="background:#f0f0f0;">
          <td style="padding:8px 12px;font-size:11px;text-transform:uppercase;color:#888888;font-weight:600;" colspan="${hasC ? data.comps.length + 3 : 3}">${sec.cat}</td>
        </tr>
      `;
      
      // Data rows
      for (let i = 0; i < (sec.rows || []).length; i++) {
        const row = sec.rows[i];
        const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
        
        if (hasC) {
          const cells = data.comps
            .map(
              (c: string) => {
                const rating = row.sc?.[c]?.r || "—";
                const ratingColor = 
                  rating === "Excellent" ? "#16a34a" :
                  rating === "Good" ? "#65a30d" :
                  rating === "Average" ? "#ca8a04" :
                  rating === "Poor" ? "#ea580c" :
                  rating === "Weak" ? "#dc2626" : "#666666";
                return `<td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #f0f0f0;font-weight:600;color:${ratingColor};">${rating}</td>`;
              }
            )
            .join("");
          tableRows += `
            <tr style="background:${rowBg};">
              <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #f0f0f0;font-weight:600;">${row.dim}</td>
              ${cells}
              <td style="padding:10px 12px;font-size:13px;color:#666666;border-bottom:1px solid #f0f0f0;">${row.ins || ""}</td>
              <td style="padding:10px 12px;font-size:13px;color:#5b21b6;border-bottom:1px solid #f0f0f0;font-weight:600;">${row.rec || ""}</td>
            </tr>
          `;
        } else {
          tableRows += `
            <tr style="background:${rowBg};">
              <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #f0f0f0;">${row.find || ""}</td>
              <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #f0f0f0;">${row.r || ""}</td>
              <td style="padding:10px 12px;font-size:13px;color:#5b21b6;border-bottom:1px solid #f0f0f0;font-weight:600;">${row.rec || ""}</td>
            </tr>
          `;
        }
      }
    }
  }
  
  const table = `
    <div style="margin:0 24px;overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;background:#ffffff;">
        <thead>
          ${tableHeaders}
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
  
  // GAP opportunity band
  const gap = data.opp ? `
    <div style="background:#fffbeb;border-left:3px solid #ca8a04;padding:14px 16px;margin:0 24px;">
      <div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">OPPORTUNITY</div>
      <div style="font-size:13px;color:#78350f;">${data.opp}</div>
    </div>
  ` : '';
  
  // CTA
  const cta = `
    <div style="text-align:center;margin:24px auto;">
      <a href="https://uxrival.xyz" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;">Run another analysis →</a>
    </div>
  `;
  
  // Footer
  const footer = `
    <div style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:16px 24px;">
      <div style="font-size:12px;color:#aaaaaa;">Sent by UX Rival · uxrival.xyz · You're receiving this because you set up a watchlist on UX Rival</div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UX Report</title>
      <style>
        @media (max-width: 600px) {
          .email-container { max-width: 100% !important; }
          .score-card { min-width: 100px !important; margin: 2px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f7;font-family:Arial, sans-serif;color:#333333;">
      <div class="email-container" style="max-width:600px;margin:0 auto;background:#ffffff;">
        ${header}
        ${headline}
        ${scoreCards}
        ${table}
        ${gap}
        ${cta}
        ${footer}
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.clone().json();
    console.log("WATCHLIST BODY:", JSON.stringify(body));
    
    const { email, category, competitors, depth, reportData } = body;

    if (!email) {
      console.log("MISSING FIELD: email");
      return NextResponse.json({ error: "email, category, and reportData required" }, { status: 400 });
    }
    if (!category) {
      console.log("MISSING FIELD: category");
      return NextResponse.json({ error: "email, category, and reportData required" }, { status: 400 });
    }
    if (!reportData) {
      console.log("MISSING FIELD: reportData");
      return NextResponse.json({ error: "No report data available. Please run an analysis first, then add to watchlist." }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

    const html = formatReportHtml(reportData);

    const resend = new Resend(resendKey);
    try {
      const data = await resend.emails.send({
        from: "UX Rival <hello@uxrival.xyz>",
        to: email,
        subject: `Your UX Rival Report — ${category}`,
        html,
      });
      console.log("RESEND RESPONSE:", JSON.stringify(data));
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.log("RESEND ERROR:", JSON.stringify(error));
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("Watchlist send error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
