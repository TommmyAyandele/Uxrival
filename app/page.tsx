"use client";
import { useState, useRef, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');`;

const INDUSTRIES = [
  { value: "custom", label: "Custom — enter your own" },
  { value: "fitness tracking app", label: "Fitness Tracking App" },
  { value: "food delivery platform", label: "Food Delivery Platform" },
  { value: "project management tool", label: "Project Management Tool" },
  { value: "e-commerce marketplace", label: "E-Commerce Marketplace" },
  { value: "travel booking platform", label: "Travel Booking Platform" },
  { value: "personal finance app", label: "Personal Finance App" },
  { value: "mental health & wellness app", label: "Mental Health & Wellness" },
  { value: "video streaming service", label: "Video Streaming Service" },
  { value: "music streaming service", label: "Music Streaming Service" },
  { value: "social media platform", label: "Social Media Platform" },
  { value: "dating app", label: "Dating App" },
  { value: "ride-sharing app", label: "Ride-Sharing App" },
  { value: "learning management system", label: "Learning Management System" },
  { value: "note-taking app", label: "Note-Taking App" },
  { value: "password manager", label: "Password Manager" },
  { value: "CRM software", label: "CRM Software" },
  { value: "HR management platform", label: "HR Management Platform" },
  { value: "healthcare patient portal", label: "Healthcare Patient Portal" },
  { value: "crypto exchange platform", label: "Crypto Exchange Platform" },
  { value: "real estate platform", label: "Real Estate Platform" },
  { value: "email client", label: "Email Client" },
  { value: "cloud storage service", label: "Cloud Storage Service" },
  { value: "video conferencing tool", label: "Video Conferencing Tool" },
  { value: "design tool for teams", label: "Design Tool for Teams" },
  { value: "developer tools & IDE", label: "Developer Tools & IDE" },
  { value: "recruitment platform", label: "Recruitment Platform" },
  { value: "grocery delivery app", label: "Grocery Delivery App" },
  { value: "fintech", label: "Fintech" },
  { value: "pet care app", label: "Pet Care App" },
];

const RATING_META: Record<string, { color: string; bg: string; border: string }> = {
  Excellent: { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)" },
  Good:      { color: "#a3e635", bg: "rgba(163,230,53,0.08)",  border: "rgba(163,230,53,0.25)" },
  Average:   { color: "#facc15", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.25)" },
  Poor:      { color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)" },
  Weak:      { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
};

function buildPrompt(category: string, competitorList: string, depth: string, focusAreas?: string) {
  const hasComp = competitorList.trim().length > 0;
  const comps = competitorList.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const focusDims = focusAreas?.trim()
    ? focusAreas.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    : null;
  const dims = focusDims && focusDims.length > 0
    ? focusDims
    : (depth === "deep"
        ? ["Onboarding", "Navigation", "Visual Design", "Key Interactions", "Info Architecture", "Accessibility"]
        : ["Onboarding", "Navigation", "Visual Design", "Key Interactions"]);

  if (hasComp) {
    const eg = comps.map((c) => `"${c}":{"r":"Good","n":"5 words"}`).join(",");
    return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}". Compare: ${comps.join(", ")}.
Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = specific design action for someone building a new product in this space.

Schema:
{"sum":"brief summary","comps":${JSON.stringify(comps)},"secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","sc":{${eg}},"ins":"gap insight","rec":"your design recommendation"}]}],"opp":"market gap"}

Topics (one section each, two rows per section): ${dims.join(", ")}.
JSON only:`;
  }

  return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}" category.
Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = one concrete design improvement a new product builder should implement.

Schema:
{"sum":"brief summary","secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","find":"current pattern","r":"Good","rec":"design recommendation"}]}],"opp":"market gap"}

Topics (one section each, two rows per section): ${dims.join(", ")}.
JSON only:`;
}

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #090909; --surface: #101012; --surface2: #17171a; --surface3: #1c1c20;
    --border: #212126; --border-hover: #38383f;
    --text: #efefef; --text-muted: #66666f; --text-dim: #3a3a42;
    --accent: #e8ff47; --accent-dim: rgba(232,255,71,0.07); --accent-glow: rgba(232,255,71,0.18);
    --red: #ff4757; --font-d: 'Syne', sans-serif; --font-m: 'DM Mono', monospace; --radius: 14px;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-d); -webkit-font-smoothing: antialiased; }
  .page { max-width: 1120px; margin: 0 auto; padding: 0 28px 140px; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(9,9,9,0.92); backdrop-filter: blur(12px); z-index: 200; }
  .nav-left { display: flex; align-items: center; gap: 10px; }
  .nav-logo { font-size: 16px; font-weight: 800; letter-spacing: -0.03em; }
  .nav-logo span { color: var(--accent); }
  .nav-pill { font-family: var(--font-m); font-size: 9px; color: var(--accent); background: var(--accent-dim); border: 1px solid rgba(232,255,71,0.2); padding: 2px 8px; border-radius: 20px; letter-spacing: 0.1em; }
  .nav-right { display: flex; align-items: center; gap: 28px; }
  .nav-links { display: flex; align-items: center; gap: 28px; }
  .nav-link { font-size: 13px; color: var(--text-muted); cursor: pointer; transition: color 0.15s; }
  .nav-link:hover { color: var(--text); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; overflow: hidden; }
  .modal-content { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); max-width: 1100px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; position: relative; }
  .modal-header { padding: 24px 24px 0; flex-shrink: 0; }
  .modal-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; line-height: 1; }
  .modal-close:hover { color: var(--text); border-color: var(--border-hover); }
  .modal-scroll { overflow: auto; padding: 24px; flex: 1; min-height: 0; }
  .modal-actions { display: flex; gap: 8px; padding: 20px 24px 24px; flex-shrink: 0; border-top: 1px solid var(--border); }
  .hero-section { padding: 52px 0 56px; }
  .hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
  .hero-left { padding-top: 8px; }
  .hero-kicker { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-m); font-size: 11px; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; background: var(--accent-dim); border: 1px solid rgba(232,255,71,0.15); padding: 5px 12px; border-radius: 20px; margin-bottom: 24px; }
  .hero-kicker::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block; }
  .hero-h1 { font-size: clamp(32px, 4.5vw, 52px); font-weight: 800; letter-spacing: -0.05em; line-height: 1.05; margin-bottom: 18px; }
  .hero-h1 em { font-style: normal; color: var(--accent); }
  .hero-sub { font-size: 16px; color: var(--text-muted); line-height: 1.65; margin-bottom: 24px; }
  .hero-trust { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .trust-item { font-family: var(--font-m); font-size: 11px; color: var(--text-dim); }
  .trust-sep { color: var(--text-dim); font-size: 11px; }
  .hero-right { position: sticky; top: 80px; }
  .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; }
  .form-row { margin-bottom: 24px; }
  .field-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; font-family: var(--font-m); }
  input[type="text"], textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--font-d); font-size: 15px; padding: 13px 16px; transition: border-color 0.15s, box-shadow 0.15s; outline: none; appearance: none; }
  input[type="text"]::placeholder, textarea::placeholder { color: var(--text-dim); }
  input[type="text"]:focus, textarea:focus { border-color: var(--border-hover); box-shadow: 0 0 0 3px rgba(232,255,71,0.06); }
  textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
  .form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 32px; padding-top: 28px; border-top: 1px solid var(--border); gap: 16px; }
  .form-hint { font-family: var(--font-m); font-size: 11px; color: var(--text-dim); }
  .btn-primary { background: var(--accent); color: #090909; border: none; border-radius: 10px; padding: 14px 28px; font-family: var(--font-d); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
  .btn-primary:hover:not(:disabled) { background: #f2ff6a; transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .dropdown-wrap { position: relative; }
  .dropdown-trigger { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--font-d); font-size: 15px; padding: 13px 16px; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between; outline: none; gap: 8px; transition: border-color 0.15s, box-shadow 0.15s; }
  .dropdown-trigger.open { border-color: var(--border-hover); box-shadow: 0 0 0 3px rgba(232,255,71,0.06); }
  .dropdown-trigger-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dropdown-trigger-text.placeholder { color: var(--text-dim); }
  .dropdown-chevron { color: var(--text-muted); font-size: 10px; transition: transform 0.15s; }
  .dropdown-chevron.open { transform: rotate(180deg); }
  .dropdown-panel { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #141418; border: 1px solid var(--border-hover); border-radius: 12px; z-index: 100; overflow: hidden; box-shadow: 0 20px 48px rgba(0,0,0,0.7); animation: dropIn 0.12s ease; }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .dropdown-search-wrap { padding: 10px 10px 8px; border-bottom: 1px solid var(--border); position: relative; }
  .dropdown-search-icon { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: 13px; pointer-events: none; }
  .dropdown-search { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 7px; color: var(--text); font-family: var(--font-m); font-size: 12px; padding: 9px 12px 9px 32px; outline: none; appearance: none; }
  .dropdown-search::placeholder { color: var(--text-dim); }
  .dropdown-list { max-height: 220px; overflow-y: auto; padding: 6px; scrollbar-width: thin; }
  .dropdown-option { padding: 10px 12px; border-radius: 7px; font-size: 14px; color: var(--text-muted); cursor: pointer; transition: background 0.1s, color 0.1s; display: flex; align-items: center; gap: 8px; }
  .dropdown-option:hover { background: var(--surface2); color: var(--text); }
  .dropdown-option.selected { color: var(--accent); background: var(--accent-dim); }
  .dropdown-option.is-custom { color: var(--text-dim); font-style: italic; }
  .dropdown-option.is-custom.selected { color: var(--accent); font-style: normal; }
  .dropdown-check { font-size: 9px; color: var(--accent); width: 10px; flex-shrink: 0; }
  .dropdown-divider { height: 1px; background: var(--border); margin: 4px 6px; }
  .dropdown-empty { padding: 20px; font-family: var(--font-m); font-size: 11px; color: var(--text-dim); text-align: center; }
  .custom-input-wrap { margin-top: 10px; }
  .radio-group { display: flex; gap: 10px; }
  .radio-card { flex: 1; position: relative; cursor: pointer; }
  .radio-card input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .radio-face { display: flex; flex-direction: column; padding: 14px 18px; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; transition: all 0.15s; cursor: pointer; user-select: none; }
  .radio-card:hover .radio-face { border-color: var(--border-hover); }
  .radio-card input:checked + .radio-face { border-color: var(--accent); background: var(--accent-dim); box-shadow: 0 0 0 1px var(--accent); }
  .radio-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-dim); flex-shrink: 0; transition: background 0.15s; }
  .radio-card input:checked + .radio-face .radio-dot { background: var(--accent); }
  .radio-name { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; transition: color 0.15s; }
  .radio-card input:checked + .radio-face .radio-name { color: var(--accent); }
  .radio-desc { font-family: var(--font-m); font-size: 11px; color: var(--text-dim); padding-left: 16px; line-height: 1.4; }
  .radio-card input:checked + .radio-face .radio-desc { color: rgba(232,255,71,0.45); }
  .loading-state { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 60px 36px; text-align: center; margin-top: 24px; }
  .loading-spinner { width: 38px; height: 38px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.75s linear infinite; margin: 0 auto 18px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-label { font-family: var(--font-m); font-size: 11px; color: var(--text-muted); letter-spacing: 0.08em; }
  .loading-dots::after { content: ''; animation: dots 1.5s steps(4,end) infinite; }
  @keyframes dots { 0%,20%{content:''} 40%{content:'.'} 60%{content:'..'} 80%,100%{content:'...'} }
  .error-state { background: rgba(255,71,87,0.05); border: 1px solid rgba(255,71,87,0.2); border-radius: var(--radius); padding: 22px 26px; display: flex; align-items: flex-start; gap: 12px; margin-top: 24px; }
  .error-icon { color: var(--red); font-size: 15px; margin-top: 1px; }
  .error-title { font-size: 14px; font-weight: 600; color: var(--red); margin-bottom: 4px; }
  .error-msg { font-size: 12px; color: var(--text-muted); line-height: 1.5; font-family: var(--font-m); }
  .result-section { padding-top: 48px; }
  .report-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .report-title-block { flex: 1; }
  .report-label { font-family: var(--font-m); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
  .report-title { font-size: 22px; font-weight: 700; letter-spacing: -0.03em; }
  .report-meta { font-family: var(--font-m); font-size: 11px; color: var(--text-dim); margin-top: 4px; }
  .report-actions { display: flex; gap: 8px; }
  .btn-secondary { background: var(--surface2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 16px; font-family: var(--font-d); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .btn-secondary:hover { border-color: var(--border-hover); }
  .btn-secondary.copied { color: var(--accent); border-color: rgba(232,255,71,0.3); }
  .summary-strip { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; padding: 16px 22px; font-size: 14px; color: #b0b0bc; line-height: 1.7; border-bottom: none; }
  .summary-strip strong { color: var(--text); }
  .table-outer { border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
  .table-outer.has-sum { border-radius: 0 0 var(--radius) var(--radius); }
  .table-scroll { overflow-x: auto; scrollbar-width: thin; }
  table { width: 100%; border-collapse: collapse; min-width: 600px; }
  thead { background: #0c0c0e; }
  thead th { padding: 12px 16px; font-family: var(--font-m); font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
  thead th:first-child { color: var(--text-dim); width: 130px; }
  thead th.comp-th { color: var(--accent); }
  thead th.rec-th { color: #7c6dfa; min-width: 180px; }
  thead th.wide-th { min-width: 160px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:nth-child(odd) { background: var(--surface); }
  tbody tr:nth-child(even) { background: #0d0d10; }
  tbody tr:hover { background: #181820; }
  td { padding: 13px 16px; vertical-align: top; font-size: 13px; line-height: 1.6; }
  td.dim-cell { font-family: var(--font-m); font-size: 10px; font-weight: 500; color: var(--text-muted); white-space: nowrap; padding-top: 16px; }
  td.text-cell { color: #8a8a98; }
  td.rec-cell { color: #a89ef5; font-size: 12px; }
  td.score-cell { min-width: 120px; }
  tr.sec-row td { background: #0a0a0d !important; padding: 7px 16px; font-family: var(--font-m); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border); }
  .score-block { display: flex; flex-direction: column; gap: 5px; }
  .rating-badge { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-m); font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 5px; border: 1px solid; width: fit-content; }
  .score-note { font-size: 11px; color: #5a5a68; line-height: 1.5; }
  .opp-band { border-top: 1px solid rgba(232,255,71,0.1); background: var(--accent-dim); padding: 14px 20px; display: flex; align-items: flex-start; gap: 12px; }
  .opp-label { font-family: var(--font-m); font-size: 9px; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; padding-top: 2px; }
  .opp-text { font-size: 13px; color: #c8d87a; line-height: 1.6; }
  .section { padding: 80px 0; border-top: 1px solid var(--border); }
  .section-eyebrow { font-family: var(--font-m); font-size: 10px; color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 14px; }
  .section-title { font-size: clamp(26px, 4vw, 38px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 12px; }
  .section-sub { font-size: 16px; color: var(--text-muted); line-height: 1.65; max-width: 480px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 48px; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: border-color 0.2s; }
  .feature-card:hover { border-color: var(--border-hover); }
  .feature-icon { font-size: 22px; margin-bottom: 16px; }
  .feature-title { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }
  .steps-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); }
  .step { padding: 32px; }
  .step:not(:last-child) { border-right: 1px solid var(--border); }
  .step-num { font-family: var(--font-m); font-size: 11px; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 16px; }
  .step-title { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
  .step-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }
  .audience-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 40px; }
  .audience-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
  .audience-role { font-size: 14px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
  .audience-role span { color: var(--accent); }
  .audience-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
  .site-footer { border-top: 1px solid var(--border); margin-top: 100px; padding: 36px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .footer-logo { font-size: 14px; font-weight: 700; letter-spacing: -0.03em; }
  .footer-logo span { color: var(--accent); }
  .footer-copy { font-family: var(--font-m); font-size: 11px; color: var(--text-dim); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.4s ease; }
  @media (max-width: 860px) { .hero-split { grid-template-columns: 1fr; gap: 36px; } .hero-right { position: static; } }
  @media (max-width: 640px) { .page { padding: 0 18px 100px; } .nav-links { display: none; } .nav-right .btn-primary { padding: 10px 18px; font-size: 13px; } .steps { grid-template-columns: 1fr; } .step:not(:last-child) { border-right: none; border-bottom: 1px solid var(--border); } .form-card { padding: 22px 18px; } .form-footer { flex-direction: column; align-items: stretch; } .radio-group { flex-direction: column; } .report-header { flex-direction: column; } .modal-actions { flex-wrap: wrap; } }
  @media print {
    .nav, .hero-section, .loading-state, .error-state, #learn, .site-footer { display: none !important; }
    .modal-overlay { position: static; background: #fff !important; padding: 0; }
    .modal-close, .modal-actions { display: none !important; }
    .modal-content { max-height: none; border: none; box-shadow: none; }
  }
`;

function RatingBadge({ rating }: { rating: string }) {
  const m = RATING_META[rating] || { color: "#4b4b58", bg: "transparent", border: "rgba(75,75,88,0.3)" };
  return (
    <span className="rating-badge" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      <span style={{ fontSize: 7 }}>●</span>{rating || "N/A"}
    </span>
  );
}

function ReportTable({ data }: { data: any }) {
  const hasC = data.comps && data.comps.length > 0;
  return (
    <div>
      {data.sum && <div className="summary-strip fade-up"><strong>Overview — </strong>{data.sum}</div>}
      <div className={`table-outer fade-up${data.sum ? " has-sum" : ""}`}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Dimension</th>
                {hasC ? (
                  <>{data.comps.map((c: string) => <th key={c} className="comp-th">{c}</th>)}<th className="wide-th">Key Insight</th><th className="rec-th">Your Move ✦</th></>
                ) : (
                  <><th className="wide-th">Current Pattern</th><th>Rating</th><th className="rec-th">Your Move ✦</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {data.secs?.map((sec: any, si: number) => (
                <>
                  <tr key={`s${si}`} className="sec-row"><td colSpan={hasC ? data.comps.length + 3 : 4}>{sec.cat}</td></tr>
                  {sec.rows?.map((row: any, ri: number) => (
                    <tr key={`${si}-${ri}`}>
                      <td className="dim-cell">{row.dim}</td>
                      {hasC ? (
                        <>{data.comps.map((c: string) => { const s = row.sc?.[c] || {}; return <td key={c} className="score-cell"><div className="score-block"><RatingBadge rating={s.r} />{s.n && <span className="score-note">{s.n}</span>}</div></td>; })}<td className="text-cell">{row.ins}</td><td className="rec-cell">{row.rec}</td></>
                      ) : (
                        <><td className="text-cell">{row.find}</td><td className="score-cell"><RatingBadge rating={row.r} /></td><td className="rec-cell">{row.rec}</td></>
                      )}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {data.opp && <div className="opp-band"><span className="opp-label">Gap</span><span className="opp-text">{data.opp}</span></div>}
      </div>
    </div>
  );
}

function IndustryDropdown({ value, customValue, onChange, onCustomChange }: {
  value: string; customValue: string; onChange: (v: string) => void; onCustomChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = INDUSTRIES.filter((o) => !search || o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = INDUSTRIES.find((o) => o.value === value);
  const displayText = value === "custom" ? (customValue.trim() || null) : (selected?.label ?? null);
  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 50); }, [open]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="dropdown-wrap" ref={wrapRef}>
      <button type="button" className={`dropdown-trigger${open ? " open" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className={`dropdown-trigger-text${!displayText ? " placeholder" : ""}`}>{displayText || "Select an industry or niche…"}</span>
        <span className={`dropdown-chevron${open ? " open" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-search-wrap">
            <span className="dropdown-search-icon">⌕</span>
            <input ref={searchRef} className="dropdown-search" type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
          <div className="dropdown-list">
            {filtered.length === 0 ? <div className="dropdown-empty">No results</div>
              : filtered.map((opt, i) => (
                <div key={opt.value}>
                  {i === 1 && <div className="dropdown-divider" />}
                  <div className={`dropdown-option${opt.value === "custom" ? " is-custom" : ""}${value === opt.value ? " selected" : ""}`} onClick={() => { onChange(opt.value); setOpen(false); setSearch(""); }}>
                    <span className="dropdown-check">{value === opt.value ? "✓" : ""}</span>{opt.label}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {value === "custom" && <div className="custom-input-wrap"><input type="text" placeholder='e.g. "AI-powered recipe app"' value={customValue} onChange={(e) => onCustomChange(e.target.value)} /></div>}
    </div>
  );
}

export default function UXRival() {
  const [industry, setIndustry] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [depth, setDepth] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const effectiveCategory = industry === "custom" ? customCategory : industry;
  const canSubmit = !loading && (industry === "custom" ? customCategory.trim().length > 0 : industry.length > 0);

  const handleGenerate = async () => {
    if (!effectiveCategory.trim()) return;
    setLoading(true); setErrorMsg(""); setReportData(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(effectiveCategory, competitors, depth, focusAreas) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text: raw } = await res.json();
      const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error(`No JSON found.`);
      setReportData(JSON.parse(raw.slice(start, end + 1)));
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error.");
    } finally { setLoading(false); }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(JSON.stringify(reportData, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleExportPdf = () => window.print();
  const scrollToLearn = () => document.getElementById("learn")?.scrollIntoView({ behavior: "smooth" });
  const scrollToForm = () => document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <nav className="nav">
          <div className="nav-left">
            <div className="nav-logo">UX<span>Rival</span></div>
            <span className="nav-pill">BETA</span>
          </div>
          <div className="nav-right">
            <div className="nav-links">
              <span className="nav-link" onClick={scrollToLearn}>Features</span>
              <span className="nav-link" onClick={scrollToLearn}>How it works</span>
              <span className="nav-link" onClick={scrollToLearn}>Who it&apos;s for</span>
            </div>
            <button type="button" className="btn-primary" onClick={scrollToForm}>Get Started Free →</button>
          </div>
        </nav>

        <section className="hero-section">
          <div className="hero-split">
            <div className="hero-left">
              <div className="hero-kicker">AI-powered UX intelligence</div>
              <h1 className="hero-h1">Know where your<br /><em>competitors</em><br />are failing</h1>
              <p className="hero-sub">Instant structured teardowns of any product category. Built for designers and agencies who move fast.</p>
              <div className="hero-trust">
                <span className="trust-item">⚡ Results in ~10s</span><span className="trust-sep">·</span>
                <span className="trust-item">30+ industries</span><span className="trust-sep">·</span>
                <span className="trust-item">Free · No signup</span>
              </div>
            </div>
            <div className="hero-right" id="form">
              <div className="form-card">
                <div className="form-row">
                  <span className="field-label">Industry or Niche</span>
                  <IndustryDropdown value={industry} customValue={customCategory} onChange={setIndustry} onCustomChange={setCustomCategory} />
                </div>
                <div className="form-row">
                  <span className="field-label">Competitors <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional · up to 3)</span></span>
                  <textarea placeholder={"Paystack\nFlutterwave\nStripe"} value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="field-label">Focus Areas <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional)</span></span>
                  <textarea placeholder="e.g. checkout flow, empty states, error handling" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="field-label">Report Depth</span>
                  <div className="radio-group">
                    <label className="radio-card">
                      <input type="radio" name="depth" value="quick" checked={depth === "quick"} onChange={() => setDepth("quick")} />
                      <div className="radio-face"><div className="radio-header"><div className="radio-dot" /><span className="radio-name">Quick Scan</span></div><span className="radio-desc">4 sections · ~10s</span></div>
                    </label>
                    <label className="radio-card">
                      <input type="radio" name="depth" value="deep" checked={depth === "deep"} onChange={() => setDepth("deep")} />
                      <div className="radio-face"><div className="radio-header"><div className="radio-dot" /><span className="radio-name">Deep Teardown</span></div><span className="radio-desc">6 sections · ~25s</span></div>
                    </label>
                  </div>
                </div>
                <div className="form-footer">
                  <span className="form-hint">Powered by Claude Sonnet</span>
                  <button className="btn-primary" onClick={handleGenerate} disabled={!canSubmit}>{loading ? "Analyzing..." : "Generate Analysis →"}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading && <div className="loading-state"><div className="loading-spinner" /><div className="loading-label"><span className="loading-dots">Analyzing UX patterns</span></div></div>}
        {errorMsg && !loading && <div className="error-state"><span className="error-icon">⚠</span><div><div className="error-title">Analysis failed</div><div className="error-msg">{errorMsg}</div></div></div>}
        {reportData && !loading && (
          <div className="modal-overlay" onClick={() => setReportData(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setReportData(null)} aria-label="Close">×</button>
              <div className="modal-header">
                <div className="report-header">
                  <div className="report-title-block">
                    <div className="report-label">// analysis complete</div>
                    <div className="report-title">{effectiveCategory}</div>
                    <div className="report-meta">{depth === "quick" ? "Quick Scan" : "Deep Teardown"}{reportData.comps?.length > 0 && ` · comparing ${reportData.comps.join(", ")}`}</div>
                  </div>
                </div>
              </div>
              <div className="modal-scroll">
                <ReportTable data={reportData} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleExportPdf}>Export as PDF</button>
                <button type="button" className={`btn-secondary${copied ? " copied" : ""}`} onClick={handleCopy}>{copied ? "✓ Copied" : "Copy JSON"}</button>
              </div>
            </div>
          </div>
        )}

        <div id="learn">
          <section className="section">
            <div className="section-eyebrow">What you get</div>
            <div className="section-title">Everything a designer needs to win</div>
            <p className="section-sub">Stop spending hours on manual competitor audits. UX Rival does it in seconds.</p>
            <div className="features-grid">
              {[
                { icon: "⚡", title: "Instant teardowns", desc: "Pick an industry and get a structured UX breakdown in under 30 seconds." },
                { icon: "⚔️", title: "Side-by-side comparison", desc: "Add up to 3 competitors and see how each scores across key UX dimensions." },
                { icon: "✦", title: "Your Move recommendations", desc: "Every row includes a concrete design action based on what competitors miss." },
                { icon: "📊", title: "Tabular reports", desc: "Clean comparison table with ratings, findings, and insights." },
                { icon: "🔍", title: "Gap analysis", desc: "Each report surfaces the biggest unmet UX opportunity in the space." },
                { icon: "🎯", title: "Depth control", desc: "Quick Scan for 4 dimensions, or Deep Teardown for a full 6-dimension audit." },
              ].map((f) => <div key={f.title} className="feature-card"><div className="feature-icon">{f.icon}</div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>)}
            </div>
          </section>
          <section className="section">
            <div className="section-eyebrow">How it works</div>
            <div className="section-title">Three steps to a full UX audit</div>
            <div className="steps-wrap" style={{ marginTop: 40 }}>
              <div className="steps">
                {[
                  { n: "01", title: "Pick your industry", desc: "Select from 30+ categories or type your own. Optionally add up to 3 competitors." },
                  { n: "02", title: "Choose depth", desc: "Quick Scan for 4 areas. Deep Teardown for 6 detailed dimensions." },
                  { n: "03", title: "Read your report", desc: "Ratings, findings, and Your Move recommendations — ready to act on." },
                ].map((s) => <div key={s.n} className="step"><div className="step-num">STEP {s.n}</div><div className="step-title">{s.title}</div><div className="step-desc">{s.desc}</div></div>)}
              </div>
            </div>
          </section>
          <section className="section">
            <div className="section-eyebrow">Who it&apos;s for</div>
            <div className="section-title">Built for people who ship products</div>
            <div className="audience-grid">
              {[
                { accent: "Product Designers", desc: "Validate decisions with competitive data before you diverge from patterns." },
                { accent: "UX Agencies", desc: "Produce client-ready audits in minutes, not days." },
                { accent: "Founders", desc: "Find UX gaps your competitors haven't filled yet." },
                { accent: "Product Managers", desc: "Brief your design team with structured competitive context." },
              ].map((a) => <div key={a.accent} className="audience-card"><div className="audience-role"><span>{a.accent}</span></div><div className="audience-desc">{a.desc}</div></div>)}
            </div>
          </section>
        </div>

        <footer className="site-footer">
          <div className="footer-logo">UX<span>Rival</span></div>
          <div className="footer-copy">Built for designers who ship · Powered by Claude</div>
        </footer>
      </div>
    </>
  );
}