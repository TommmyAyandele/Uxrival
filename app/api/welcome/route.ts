import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to UX Rival</title>
</head>
<body style="margin:0;padding:0;background:#090909;font-family:'Segoe UI',system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px">
    <div style="font-size:22px;font-weight:800;letter-spacing:-0.03em;margin-bottom:40px">
      <span style="color:#efefef">UX</span><span style="color:#e8ff47">Rival</span>
    </div>
    <h1 style="font-size:28px;font-weight:800;color:#efefef;margin:0 0 20px;line-height:1.2">Your free UX analysis is ready 🎉</h1>
    <p style="font-size:16px;color:#b0b0bc;line-height:1.65;margin:0 0 32px">Welcome to UX Rival — the fastest way to understand what your competitors are doing wrong (and how to beat them). You now have full access to instant UX teardowns, competitor scoring, heatmaps and weekly monitoring.</p>
    <a href="https://uxrival.xyz" style="display:inline-block;background:#e8ff47;color:#090909;font-size:15px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:10px;margin-bottom:40px">Run Your Next Analysis →</a>
    <h2 style="font-size:14px;font-weight:700;color:#efefef;margin:0 0 16px;letter-spacing:0.02em">What you can do now:</h2>
    <ul style="margin:0;padding:0;list-style:none">
      <li style="font-size:15px;color:#b0b0bc;line-height:1.6;margin-bottom:12px;padding-left:0">⚡ Analyze any product category in 30 seconds</li>
      <li style="font-size:15px;color:#b0b0bc;line-height:1.6;margin-bottom:12px;padding-left:0">⚔️ Compare up to 3 competitors side by side</li>
      <li style="font-size:15px;color:#b0b0bc;line-height:1.6;margin-bottom:12px;padding-left:0">👁 Watch a category and get weekly email updates</li>
      <li style="font-size:15px;color:#b0b0bc;line-height:1.6;margin-bottom:12px;padding-left:0">📄 Export reports as PDF or share with clients</li>
    </ul>
    <p style="font-size:11px;color:#666;margin-top:48px;line-height:1.5">You're receiving this because you signed up at uxrival.xyz · Unsubscribe</p>
  </div>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "UX Rival <hello@uxrival.xyz>",
      to: email,
      subject: "Welcome to UX Rival — your free analysis is ready 🎉",
      html: welcomeHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Welcome email error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
