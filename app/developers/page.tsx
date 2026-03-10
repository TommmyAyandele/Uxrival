"use client";
import React, { useState } from "react";

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0a;
    color: #efefef;
    line-height: 1.6;
  }

  .page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 28px 140px;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #333;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-logo {
    font-size: 18px;
    font-weight: 800;
    color: #efefef;
    text-decoration: none;
  }

  .nav-logo span:first-child {
    color: #efefef;
  }

  .nav-logo span:last-child {
    color: #e8ff47;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .nav-link {
    color: #888;
    text-decoration: none;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #efefef;
  }

  .hero {
    padding: 80px 0;
    text-align: center;
  }

  .hero-label {
    font-size: 12px;
    font-weight: 700;
    color: #e8ff47;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 48px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 20px;
    line-height: 1.1;
  }

  .hero-subtitle {
    font-size: 20px;
    color: #888;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .base-url {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 60px;
  }

  .base-url-text {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 14px;
    color: #e8ff47;
  }

  .copy-btn {
    background: #333;
    border: none;
    color: #efefef;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s;
  }

  .copy-btn:hover {
    background: #444;
  }

  .copy-btn.copied {
    background: #e8ff47;
    color: #0a0a0a;
  }

  .section {
    margin-bottom: 80px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 24px;
  }

  .endpoint-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 32px;
    border: 1px solid #333;
  }

  .endpoint-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .method {
    background: #e8ff47;
    color: #0a0a0a;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .endpoint-path {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 18px;
    color: #ffffff;
  }

  .endpoint-description {
    color: #888;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th {
    text-align: left;
    padding: 12px;
    background: #0a0a0a;
    border-bottom: 1px solid #333;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .table td {
    padding: 12px;
    border-bottom: 1px solid #333;
    font-size: 14px;
  }

  .table td:first-child {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    color: #e8ff47;
  }

  .code-block {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 24px;
    overflow-x: auto;
    margin-bottom: 60px;
  }

  .code-block pre {
    margin: 0;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #efefef;
  }

  .code-block .string {
    color: #e8ff47;
  }

  .code-block .keyword {
    color: #7c6dfa;
  }

  .code-block .number {
    color: #f97316;
  }

  .try-it-form {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 60px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    background: #0a0a0a;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 12px;
    color: #efefef;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #e8ff47;
  }

  .form-textarea {
    min-height: 80px;
    resize: vertical;
  }

  .depth-toggle {
    display: flex;
    gap: 8px;
  }

  .depth-btn {
    background: #0a0a0a;
    border: 1px solid #333;
    color: #888;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .depth-btn.active {
    background: #e8ff47;
    color: #0a0a0a;
    border-color: #e8ff47;
  }

  .try-btn {
    background: #e8ff47;
    color: #0a0a0a;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .try-btn:hover {
    background: #d4e53a;
  }

  .try-btn:disabled {
    background: #333;
    color: #888;
    cursor: not-allowed;
  }

  .response-block {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 24px;
    max-height: 400px;
    overflow-y: auto;
  }

  .response-block pre {
    margin: 0;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #efefef;
    white-space: pre-wrap;
  }

  .rate-limits {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
  }

  .rate-limits-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .rate-limits-text {
    font-size: 16px;
    color: #888;
  }

  .footer {
    text-align: center;
    padding: 40px 0;
    border-top: 1px solid #333;
  }

  .footer-link {
    color: #888;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
  }

  .footer-link:hover {
    color: #efefef;
  }

  @media (max-width: 768px) {
    .page {
      padding: 0 18px 100px;
    }

    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 16px;
    }

    .nav-right {
      display: none;
    }

    .endpoint-card,
    .try-it-form,
    .rate-limits {
      padding: 20px;
    }
  }
`;

export default function DevelopersPage() {
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState("fintech");
  const [competitors, setCompetitors] = useState("Paystack\nFlutterwave");
  const [depth, setDepth] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const copyBaseUrl = () => {
    navigator.clipboard.writeText("https://uxrival.xyz/api/v1");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tryApi = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          competitors: competitors.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
          depth
        })
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: (error as Error).message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <nav className="nav">
          <div className="nav-left">
            <a href="/" className="nav-logo">
              <span>UX</span><span>Rival</span>
            </a>
          </div>
          <div className="nav-right">
            <a href="/" className="nav-link">← Back to UX Rival</a>
          </div>
        </nav>

        <div className="hero">
          <div className="hero-label">// PUBLIC API</div>
          <h1 className="hero-title">Build with UX Rival</h1>
          <p className="hero-subtitle">
            Integrate AI-powered UX analysis into your own tools. Free. No API key required.
          </p>
          
          <div className="base-url">
            <span className="base-url-text">https://uxrival.xyz/api/v1</span>
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyBaseUrl}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Endpoint</h2>
          <div className="endpoint-card">
            <div className="endpoint-header">
              <span className="method">POST</span>
              <span className="endpoint-path">/analyze</span>
            </div>
            <p className="endpoint-description">
              Run a comprehensive UX analysis for any product category. Get instant insights on competitors, 
              scoring, recommendations, and market gaps.
            </p>
            
            <table className="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>category</td>
                  <td>string (required)</td>
                  <td>The product category to analyze (e.g., "fintech", "food delivery")</td>
                </tr>
                <tr>
                  <td>competitors</td>
                  <td>string[] (optional)</td>
                  <td>List of competitor names (max 3). One per line or comma-separated.</td>
                </tr>
                <tr>
                  <td>depth</td>
                  <td>string</td>
                  <td>Analysis depth: "quick" (default) or "deep"</td>
                </tr>
                <tr>
                  <td>focusAreas</td>
                  <td>string (optional)</td>
                  <td>Specific areas to focus on (e.g., "onboarding, navigation")</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Code Example</h2>
          <div className="code-block">
            <pre>{`const response = await fetch("https://uxrival.xyz/api/v1/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    category: "fintech",
    competitors: ["Paystack", "Flutterwave"],
    depth: "quick"
  })
});
const data = await response.json();`}</pre>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Try It Live</h2>
          <div className="try-it-form">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., fintech, food delivery"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Competitors</label>
              <textarea
                className="form-textarea"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="Paystack&#10;Flutterwave&#10;Stripe"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Depth</label>
              <div className="depth-toggle">
                <button
                  type="button"
                  className={`depth-btn ${depth === "quick" ? "active" : ""}`}
                  onClick={() => setDepth("quick")}
                >
                  Quick
                </button>
                <button
                  type="button"
                  className={`depth-btn ${depth === "deep" ? "active" : ""}`}
                  onClick={() => setDepth("deep")}
                >
                  Deep
                </button>
              </div>
            </div>
            
            <button className="try-btn" onClick={tryApi} disabled={loading}>
              {loading ? "Running..." : "Run API Call"}
            </button>
          </div>
          
          {response && (
            <div className="response-block">
              <pre>{response}</pre>
            </div>
          )}
        </div>

        <div className="section">
          <h2 className="section-title">Rate Limits</h2>
          <div className="rate-limits">
            <div className="rate-limits-title">10 requests per minute · Free · No signup</div>
            <p className="rate-limits-text">
              Our public API is free to use with generous rate limits. No API key or registration required.
            </p>
          </div>
        </div>

        <footer className="footer">
          <a href="/" className="footer-link">← Back to uxrival.xyz</a>
        </footer>
      </div>
    </>
  );
}
