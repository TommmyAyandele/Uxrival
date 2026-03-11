import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function formatReportHtml(data: any): string {
  const hasC = data.comps && data.comps.length > 0;
  
  // Header
  const header = `
    <div style="background:#0a0a0a;padding:24px 32px;text-align:center;position:relative;">
      <div style="display:inline-block;vertical-align:middle;">
        <span style="color:#efefef;font-size:24px;font-weight:800;letter-spacing:-0.03em;">UX</span>
        <span style="color:#e8ff47;font-size:24px;font-weight:800;letter-spacing:-0.03em;">Rival</span>
      </div>
      <div style="position:absolute;right:32px;top:50%;transform:translateY(-50%);background:#e8ff47;color:#0a0a0a;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
        AI UX Report
      </div>
    </div>
  `;
  
  // Headline band
  const headline = data.headline ? `
    <div style="background:#111111;padding:28px 32px;margin:0;">
      <div style="border-left:3px solid #e8ff47;padding:0 16px;">
        <h2 style="color:#ffffff;font-size:18px;font-weight:700;margin:0;line-height:1.4;">${data.headline}</h2>
      </div>
    </div>
    ` : '';
  
  // Summary
  const summary = data.sum ? `
    <div style="padding:20px 32px;margin:0;">
      <p style="font-size:14px;color:#b0b0bc;line-height:1.6;">
        <strong style="color:#efefef;">Overview —</strong> ${data.sum}
      </p>
    </div>
    ` : '';
  
  // Score cards
  const scoreCards = hasC ? `
    <div style="background:#ffffff;padding:20px 32px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">
      ${data.comps.map((comp: string, index: number) => {
        const score = data.scores?.[comp] || 0;
        const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#a3e635' : score >= 40 ? '#facc15' : '#f87171';
        return `
          <div style="border:1px solid #eeeeee;border-radius:12px;padding:16px 20px;text-align:center;min-width:120px;flex:1;">
            <div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${comp}</div>
            <div style="font-size:36px;font-weight:700;color:${scoreColor};margin-bottom:4px;">${score}</div>
            <div style="font-size:11px;color:#888888;">${score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor'}</div>
          </div>
        `;
      }).join('')}
    </div>
    ` : '';
  
  // Table
  let tableRows = '';
  if (data.secs) {
    for (const sec of data.secs) {
      tableRows += `
        <tr style="background:#1a1a28;color:#888888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;padding:10px 12px;">
          <td style="font-weight:600;">${sec.cat}</td>
          ${hasC ? data.comps.map(() => `<td style="padding:10px 12px;text-align:center;font-weight:600;">Competitor</td>`).join('') : ''}
          <td style="padding:10px 12px;">Key Insight</td>
          <td style="padding:10px 12px;">Your Move</td>
        </tr>
      `;
      
      for (const row of sec.rows || []) {
        if (hasC) {
          const cells = data.comps
            .map(
              (c: string) => {
                const rating = row.sc?.[c]?.r || "—";
                const ratingColor = 
                  rating === "Excellent" ? "#4ade80" :
                  rating === "Good" ? "#a3e635" :
                  rating === "Average" ? "#facc15" :
                  rating === "Poor" ? "#f97316" :
                  rating === "Weak" ? "#f87171" : "#666666";
                return `<td style="padding:12px;font-size:13px;color:#ffffff;border-bottom:1px solid #1a1a28;"><span style="color:${ratingColor};font-weight:600;">${rating}</span></td>`;
              }
            )
            .join("");
          tableRows += `
            <tr style="border-bottom:1px solid #1a1a28;">
              <td style="padding:12px;font-size:11px;color:#888888;font-weight:600;">${row.dim}</td>
              ${cells}
              <td style="padding:12px;font-size:12px;color:#b0b0bc;">${row.ins || ""}</td>
              <td style="padding:12px;font-size:12px;color:#e8ff47;">${row.rec || ""}</td>
            </tr>
          `;
        } else {
          tableRows += `
            <tr style="border-bottom:1px solid #1a1a28;">
              <td style="padding:12px;font-size:11px;color:#888888;">${row.find || ""}</td>
              <td style="padding:12px;font-size:13px;">${row.r || ""}</td>
              <td style="padding:12px;font-size:12px;color:#e8ff47;">${row.rec || ""}</td>
            </tr>
          `;
        }
      }
    }
  }
  
  const table = `
    <div style="margin:0 32px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #1a1a28;border-radius:8px;background:#ffffff;">
        <thead style="background:#1a1a28;">
          <tr>
            <th style="padding:12px;font-size:11px;color:#888888;text-align:left;">Dimension</th>
            ${hasC ? data.comps.map(() => `<th style="padding:12px;font-size:11px;color:#888888;text-align:center;">Competitor</th>`).join('') : ''}
            <th style="padding:12px;font-size:11px;color:#888888;text-align:left;">Key Insight</th>
            <th style="padding:12px;font-size:11px;color:#888888;text-align:left;">Your Move</th>
          </tr>
        </thead>
        <tbody style="font-size:13px;">
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
  
  // GAP opportunity band
  const gap = data.opp ? `
    <div style="background:#1a1500;border-left:3px solid #e8ff47;padding:14px 16px;margin-top:16px;">
      <div style="font-size:10px;color:#8a7a00;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">OPPORTUNITY</div>
      <div style="font-size:13px;color:#ccaa00;">${data.opp}</div>
    </div>
  ` : '';
  
  // CTA
  const cta = `
    <div style="text-align:center;margin:24px auto;">
      <a href="https://uxrival.xyz" style="display:inline-block;background:#e8ff47;color:#0a0a0a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;width:fit-content;">Run another analysis →</a>
    </div>
  `;
  
  // Footer
  const footer = `
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eeeeee;">
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
          .score-card { min-width: 100px !important; }
          .score-cards { flex-direction: column !important; gap: 12px !important; }
          table { width: calc(100% - 64px) !important; }
          thead th:nth-child(n+3), thead th:nth-child(n+4) { display: none !important; }
          td:nth-child(n+3) { display: none !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#ffffff;font-family:Arial, sans-serif;color:#333333;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        ${header}
        ${headline}
        ${summary}
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
