import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(req: NextRequest) {
  try {
    const { role, source, suggestion } = await req.json();
    await resend.emails.send({
      from: "UX Rival <hello@uxrival.xyz>",
      to: "ayangbohunmi1@gmail.com",
      subject: "New UX Rival Feedback",
      html: `<div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px;">
        <h2 style="color: #0a0a0a;">New Feedback Received</h2>
        <p><strong>Role:</strong> ${role || "Not provided"}</p>
        <p><strong>Source:</strong> ${source || "Not provided"}</p>
        <p><strong>Suggestion:</strong> ${suggestion || "Not provided"}</p>
      </div>`
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
