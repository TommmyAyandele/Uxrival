"use client";
import React, { useState } from "react";

export default function DevelopersPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToLearn = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  const scrollToForm = () => window.location.href = "/";

  return (
    <div data-theme={theme}>
      <style>{`
        :root {
          --bg: #0a0a0a;
          --surface: #111111;
          --surface2: #1a1a1a;
          --surface3: #252525;
          --border: #333333;
          --border-hover: #444444;
          --text: #efefef;
          --text-muted: #888888;
          --accent: #e8ff47;
          --accent-dim: rgba(232,255,71,0.1);
          --red: #ff4757;
          --radius: 12px;
          --font-m: ui-monospace, SF Mono, Monaco, 'Cascadia Code', Roboto Mono, Consolas, 'Courier New', monospace;
          --font-d: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        [data-theme="light"] {
          --bg: #ffffff;
          --surface: #f8f8f8;
          --surface2: #f0f0f0;
          --surface3: #e5e5e5;
          --border: #e0e0e0;
          --border-hover: #d0d0d0;
          --text: #1a1a1a;
          --text-muted: #666666;
          --accent: #8a7a00;
          --accent-dim: rgba(138,122,0,0.1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }

        .page {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 28px 140px;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 0;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: rgba(9,9,9,0.92);
          backdrop-filter: blur(12px);
          z-index: 200;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
          text-decoration: none;
        }

        .nav-logo span {
          color: var(--accent);
        }

        .nav-pill {
          font-family: var(--font-m);
          font-size: 9px;
          color: var(--accent);
          background: var(--accent-dim);
          border: 1px solid rgba(232,255,71,0.2);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.1em;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link {
          font-size: 13px;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s;
        }

        .nav-link:hover {
          color: var(--text);
        }

        .theme-toggle {
          display: inline-flex;
          padding: 3px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 20px;
          gap: 0;
        }

        .theme-toggle-option {
          font-family: var(--font-m);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .theme-toggle-option:hover {
          color: var(--text);
        }

        .theme-toggle-option.active {
          background: var(--surface3);
          color: var(--text);
        }

        .btn-primary {
          background: var(--accent);
          color: #090909;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: var(--font-d);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-primary:hover {
          background: #d4e642;
          transform: translateY(-1px);
        }

        .nav-badge {
          background: var(--accent);
          color: #090909;
          font-family: var(--font-m);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 6px;
        }

        /* Mobile hamburger menu */
        .mobile-hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .hamburger-line {
          width: 20px;
          height: 2px;
          background-color: var(--text);
          transition: all 0.2s ease;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-menu-panel {
          width: 280px;
          height: 100%;
          background: var(--bg);
          border-left: 1px solid var(--border);
          transform: translateX(100%);
          transition: transform 0.25s ease;
          position: relative;
          right: 0;
        }

        .mobile-menu-overlay .mobile-menu-panel {
          transform: translateX(0);
        }

        .mobile-menu-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: var(--text);
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
        }

        .mobile-menu-items {
          padding: 60px 20px 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-item {
          height: 48px;
          display: flex;
          align-items: center;
          font-size: 16px;
          color: var(--text);
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: color 0.15s;
        }

        .mobile-menu-item:hover {
          color: var(--accent);
        }

        .mobile-theme-toggle {
          display: flex;
          padding: 20px 0;
          gap: 8px;
        }

        .mobile-menu-cta {
          margin-top: auto;
          padding-top: 20px;
        }

        @media (max-width: 640px) {
          .page {
            padding: 0 18px 100px;
          }

          .nav-links {
            display: none;
          }

          .theme-toggle {
            display: none;
          }

          .nav-right .btn-primary {
            display: none;
          }

          .mobile-hamburger {
            display: flex;
          }
        }

        [data-theme="light"] .nav {
          background: rgba(255,255,255,0.92);
        }

        [data-theme="light"] .nav-logo span {
          color: #8a7a00;
        }

        [data-theme="light"] .nav-pill {
          color: #8a7a00;
          background: var(--accent-dim);
          border-color: rgba(200,184,0,0.2);
        }

        [data-theme="light"] .nav-badge {
          background: #8a7a00;
          color: white;
        }

        .hero {
          padding: 80px 0;
          text-align: center;
        }

        .hero-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 20px;
          color: var(--text-muted);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .base-url {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 40px;
        }

        .base-url-text {
          font-family: var(--font-m);
          font-size: 16px;
          color: var(--accent);
          background: var(--surface);
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .copy-btn {
          background: var(--accent);
          color: #090909;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: var(--font-m);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .copy-btn:hover {
          background: #d4e642;
        }

        .copy-btn.copied {
          background: #4caf50;
        }

        .section {
          padding: 60px 0;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 24px;
        }

        .endpoint-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 40px;
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .method {
          background: var(--accent);
          color: #090909;
          font-family: var(--font-m);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .endpoint-path {
          font-family: var(--font-m);
          font-size: 20px;
          color: var(--text);
          background: var(--surface);
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .endpoint-description {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }

        .table th {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-m);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .code-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 32px;
          overflow-x: auto;
        }

        .code-block pre {
          margin: 0;
          font-family: var(--font-m);
          font-size: 14px;
          color: var(--text);
          white-space: pre;
          overflow-x: auto;
        }

        .try-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
        }

        .try-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
        }

        .try-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .form-input {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          color: var(--text);
          width: 100%;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .try-btn {
          background: var(--accent);
          color: #090909;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: var(--font-d);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          align-self: flex-start;
        }

        .try-btn:hover {
          background: #d4e642;
          transform: translateY(-1px);
        }

        .try-result {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px;
          margin-top: 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .result-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }

        .result-json {
          font-family: var(--font-m);
          font-size: 12px;
          color: var(--text);
          white-space: pre;
          overflow-x: auto;
        }

        .rate-limits {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          margin-top: 32px;
        }

        .rate-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
        }

        .rate-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .rate-item:last-child {
          border-bottom: none;
        }

        .rate-label {
          font-size: 14px;
          color: var(--text-muted);
        }

        .rate-value {
          font-family: var(--font-m);
          font-size: 14px;
          color: var(--accent);
          font-weight: 600;
        }

        .footer {
          text-align: center;
          padding: 40px 0;
          border-top: 1px solid var(--border);
        }

        .footer-link {
          color: var(--accent);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .footer-link:hover {
          text-decoration: underline;
        }
      `}</style>
      
      <div className="page">
        <nav className="nav">
          <div className="nav-left">
            <a href="/" className="nav-logo">
              <span>UX</span><span>Rival</span>
            </a>
            <span className="nav-pill">BETA</span>
          </div>
          <div className="nav-right">
            <div className="nav-links">
              <span className="nav-link" onClick={scrollToLearn}>Features</span>
              <span className="nav-link" onClick={scrollToLearn}>How it works</span>
              <span className="nav-link" onClick={scrollToLearn}>Who it&apos;s for</span>
              <span className="nav-link" onClick={() => window.location.href = "/"}>History</span>
              <span className="nav-link" onClick={() => window.location.href = "/"}>Watchlist</span>
              <span className="nav-link" onClick={() => window.location.href = "/"}>API</span>
            </div>
            <div className="theme-toggle">
              <button type="button" className={`theme-toggle-option${theme === "dark" ? " active" : ""}`} onClick={() => setTheme("dark")}>Dark</button>
              <button type="button" className={`theme-toggle-option${theme === "light" ? " active" : ""}`} onClick={() => setTheme("light")}>Light</button>
            </div>
            <button type="button" className="btn-primary" onClick={scrollToForm}>Get Started Free →</button>
            
            {/* Mobile hamburger button */}
            <button 
              type="button" 
              className="mobile-hamburger" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          </div>
        </nav>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="mobile-menu-close" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
              
              <div className="mobile-menu-items">
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); scrollToLearn(); }}>Features</div>
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); scrollToLearn(); }}>How it works</div>
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); scrollToLearn(); }}>Who it&apos;s for</div>
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); window.location.href = "/"; }}>History</div>
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); window.location.href = "/"; }}>Watchlist</div>
                <div className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); window.location.href = "/"; }}>API</div>
                
                <div className="mobile-theme-toggle">
                  <button type="button" className={`theme-toggle-option${theme === "dark" ? " active" : ""}`} onClick={() => setTheme("dark")}>Dark</button>
                  <button type="button" className={`theme-toggle-option${theme === "light" ? " active" : ""}`} onClick={() => setTheme("light")}>Light</button>
                </div>
                
                <div className="mobile-menu-cta">
                  <button type="button" className="btn-primary" onClick={() => { setMobileMenuOpen(false); scrollToForm(); }}>Get Started Free →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="hero">
          <div className="hero-label">// PUBLIC API</div>
          <h1 className="hero-title">Build with UX Rival</h1>
          <p className="hero-subtitle">
            Integrate AI-powered UX analysis into your own tools. Free. No API key required.
          </p>
          
          <div className="base-url">
            <span className="base-url-text">https://uxrival.xyz/api/v1</span>
            <button className="copy-btn">Copy</button>
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
                  <td>string</td>
                  <td>Product category to analyze (e.g., "fintech", "ecommerce")</td>
                </tr>
                <tr>
                  <td>competitors</td>
                  <td>array</td>
                  <td>Array of competitor names (e.g., ["Paystack", "Flutterwave"])</td>
                </tr>
                <tr>
                  <td>depth</td>
                  <td>string</td>
                  <td>Analysis depth: "quick" or "deep"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Example Request</h2>
          <div className="code-block">
            <pre>{`const res = await fetch("https://uxrival.xyz/api/v1/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    category: "fintech",
    competitors: ["Paystack", "Flutterwave"],
    depth: "quick"
  })
});
const data = await res.json();`}</pre>
          </div>
        </div>

        <div className="try-section">
          <h2 className="try-title">Try it Live</h2>
          <div className="try-form">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., fintech"
                defaultValue="fintech"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Competitors</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder='["Paystack", "Flutterwave"]'
                defaultValue='["Paystack", "Flutterwave"]'
              />
            </div>
            <div className="form-group">
              <label className="form-label">Depth</label>
              <select className="form-input" defaultValue="quick">
                <option value="quick">Quick</option>
                <option value="deep">Deep</option>
              </select>
            </div>
            <button className="try-btn">Analyze</button>
          </div>
          <div className="try-result">
            <div className="result-title">Response</div>
            <div className="result-json">{`{
  "category": "fintech",
  "competitors": ["Paystack", "Flutterwave"],
  "depth": "quick",
  "analysis": {
    "scores": {
      "Paystack": 85,
      "Flutterwave": 92
    },
    "recommendations": [
      "Consider implementing biometric authentication",
      "Add transaction history features"
    ]
  }
}`}</div>
          </div>
        </div>

        <div className="rate-limits">
          <h3 className="rate-title">Rate Limits</h3>
          <div className="rate-list">
            <div className="rate-item">
              <span className="rate-label">Requests per minute</span>
              <span className="rate-value">10</span>
            </div>
            <div className="rate-item">
              <span className="rate-label">Burst limit</span>
              <span className="rate-value">30 requests per hour</span>
            </div>
            <div className="rate-item">
              <span className="rate-label">Reset window</span>
              <span className="rate-value">1 minute</span>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>
            <a href="/" className="footer-link">← Back to UX Rival</a>
          </p>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            Built for developers who ship · Powered by Claude
          </p>
        </footer>
      </div>
    </div>
  );
}
