import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, category, competitors, frequency } = await req.json();

    if (!email || !category || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields: email, category, frequency' },
        { status: 400 }
      );
    }

    const competitorsList = competitors && competitors.trim() 
      ? competitors.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean).join(', ')
      : 'No specific competitors';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're now watching ${category} — UX Rival</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.02em;
        }
        .logo span {
            color: #e8ff47;
        }
        .headline {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 24px;
            text-align: center;
        }
        .body {
            font-size: 16px;
            margin-bottom: 32px;
            text-align: center;
        }
        .summary-card {
            background-color: #111111;
            border: 1px solid #333333;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
        }
        .summary-item {
            margin-bottom: 16px;
        }
        .summary-item:last-child {
            margin-bottom: 0;
        }
        .summary-label {
            color: #e8ff47;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 4px;
        }
        .summary-value {
            font-size: 16px;
            color: #ffffff;
        }
        .cta {
            text-align: center;
            margin-bottom: 40px;
        }
        .cta-button {
            display: inline-block;
            background-color: #e8ff47;
            color: #0a0a0a;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background-color: #d4e642;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 40px;
        }
        .footer a {
            color: #e8ff47;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">UX<span>Rival</span></div>
        </div>
        
        <div class="headline">
            You're now watching ${category} 👁
        </div>
        
        <div class="body">
            You'll receive a fresh UX analysis of ${category} every ${frequency.toLowerCase()}. We'll track ${competitorsList} and email you when the competitive landscape shifts.
        </div>
        
        <div class="summary-card">
            <div class="summary-item">
                <div class="summary-label">Category</div>
                <div class="summary-value">${category}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Competitors</div>
                <div class="summary-value">${competitorsList}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Frequency</div>
                <div class="summary-value">${frequency}</div>
            </div>
        </div>
        
        <div class="cta">
            <a href="https://uxrival.xyz" class="cta-button">View Latest Analysis →</a>
        </div>
        
        <div class="footer">
            You're receiving this because you set up a watchlist on uxrival.xyz · To stop receiving updates remove this item from your watchlist
        </div>
    </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'UX Rival <hello@uxrival.xyz>',
      to: [email],
      subject: `You're now watching ${category} — UX Rival`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });

  } catch (error) {
    console.error('Watchlist confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
