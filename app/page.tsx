"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const EMAIL_STORAGE_KEY = "uxrival_email";
const WATCHLIST_STORAGE_KEY = "uxrival_watchlist";
const THEME_STORAGE_KEY = "uxrival_theme";
const TOUR_STORAGE_KEY = "uxrival_toured";
const HISTORY_STORAGE_KEY = "uxrival_history";

type WatchlistItem = { id: string; category: string; competitors: string; depth: string; email: string; frequency: string; savedAt: string; reportData: any };
type HistoryItem = { id: string; category: string; competitors: string; depth: string; reportData: any; createdAt: string };

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
}
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

function buildPrompt(category: string, competitorList: string, depth: string, focusAreas?: string, myProduct?: string) {
  const otherComps = competitorList.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const comps = myProduct?.trim()
    ? [myProduct.trim(), ...otherComps.slice(0, 2)]
    : otherComps.slice(0, 3);
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
    const eg = comps.map((c) => `"${c}":{"r":"Good","n":"5 words"}`).join(",");
    const myProductNote = myProduct?.trim() ? "\nThe first competitor listed is the user's own product — be objective but highlight where it has advantages.\n" : "";
    return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}". Compare: ${comps.join(", ")}.
${myProductNote}Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = specific design action for someone building a new product in this space.
"steal" = real-world example of a product that does this dimension well, max 8 words (e.g. "Duolingo's progress bar after each lesson").

Schema:
{"headline":"single punchy sentence max 20 words summarizing biggest opportunity","sum":"brief summary","scores":{"CompetitorName":0-100 per competitor},"comps":${JSON.stringify(comps)},"secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","sc":{${eg}},"ins":"gap insight","rec":"your design recommendation","steal":"real-world example max 8 words"}]}],"opp":"market gap"}

Include "scores" object with overall UX score 0-100 per competitor. Topics (one section each, two rows per section): ${dims.join(", ")}.
JSON only:`;
  }

  return `Output ONLY valid JSON. No markdown, no explanation, no extra text.

UX analysis of "${category}" category.
Ratings: Excellent|Good|Average|Poor|Weak. Keep ALL text values under 7 words.
"rec" = one concrete design improvement a new product builder should implement.
"steal" = real-world example of a product that does this dimension well, max 8 words (e.g. "Stripe's inline error messages on forms").

Schema:
{"headline":"single punchy sentence max 20 words summarizing biggest opportunity","sum":"brief summary","category_score":0-100,"secs":[{"cat":"Onboarding","rows":[{"dim":"Sign-up","find":"current pattern","r":"Good","rec":"design recommendation","steal":"real-world example max 8 words"}]}],"opp":"market gap"}

Include "category_score" with overall UX score 0-100 for the category. Topics (one section each, two rows per section): ${dims.join(", ")}.
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
  [data-theme="light"] {
    --bg: #ffffff;
    --surface: #f5f5f7;
    --surface2: #ebebed;
    --surface3: #e0e0e3;
    --border: #d1d1d6;
    --border-hover: #b0b0b8;
    --text: #0a0a0a;
    --text-muted: #4a4a55;
    --text-dim: #8a8a98;
    --accent: #c8b800;
    --accent-dim: rgba(200,184,0,0.08);
    --accent-glow: rgba(200,184,0,0.18);
  }
  .thead { background: #f0f0f2; }
  .tbody tr:nth-child(odd) { background: #ffffff; }
  .tbody tr:nth-child(even) { background: #f8f8fa; }
  .tbody tr:hover { background: #efefef; }
  .sec-row td { background: #e8e8ec !important; color: #888; }
  .modal-content { background: var(--surface); }
  .modal-overlay { background: rgba(0,0,0,0.4); }
  .summary-strip { background: var(--surface); border-color: var(--border); }
  .table-outer { border-color: var(--border); }
  .opp-band { background: rgba(180,160,0,0.08); }
  .score-note { color: #888; }
  td.text-cell { color: #555; }
  td.rec-cell { color: #5a4fd6; }
  .report-label { color: #8a7a00; }
  .report-meta { color: #888; }
  .modal-actions { background: var(--surface); border-top: 1px solid var(--border); }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-d); -webkit-font-smoothing: antialiased; transition: background 0.2s, color 0.2s; }
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
  .theme-toggle { display: inline-flex; padding: 3px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; gap: 0; }
  .theme-toggle-option { font-family: var(--font-m); font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 16px; background: transparent; border: none; cursor: pointer; transition: all 0.15s; }
  .theme-toggle-option:hover { color: var(--text); }
  .theme-toggle-option.active { background: var(--surface3); color: var(--text); }
  [data-theme="light"] .nav { background: rgba(255,255,255,0.92); }
  [data-theme="light"] .nav-logo span { color: #8a7a00; }
  [data-theme="light"] .nav-pill { color: #8a7a00; background: var(--accent-dim); border-color: rgba(200,184,0,0.2); }
  [data-theme="light"] .nav-badge { background: #8a7a00; color: white; }
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
  .score-cards-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
  .score-card { flex: 1; min-width: 100px; max-width: 180px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
  .score-card-name { font-family: var(--font-m); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .score-card-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
  .score-card-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .score-card-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
  .headline-band { font-family: var(--font-d); font-size: 20px; font-weight: 800; border-left: 3px solid var(--accent); padding: 16px 20px; background: var(--surface); margin-bottom: 16px; }
  .view-toggle { display: inline-flex; padding: 3px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; gap: 0; margin-bottom: 20px; }
  .view-toggle-btn { padding: 8px 16px; font-family: var(--font-m); font-size: 11px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; border-radius: 16px; cursor: pointer; transition: all 0.15s; }
  .view-toggle-btn:hover { color: var(--text); }
  .view-toggle-btn.active { background: var(--accent); color: #090909; }
  .heatmap-grid { display: grid; gap: 1px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .heatmap-cell { min-width: 80px; min-height: 60px; display: flex; align-items: center; justify-content: center; font-family: var(--font-m); font-size: 10px; font-weight: 600; text-align: center; padding: 8px; }
  .heatmap-header { font-family: var(--font-m); font-size: 10px; color: var(--text-muted); background: var(--surface2); padding: 10px 12px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .comp-th.you-col, td.you-col { background: var(--accent-dim) !important; }
  .you-badge { font-family: var(--font-m); font-size: 8px; color: var(--accent); background: rgba(232,255,71,0.15); border: 1px solid rgba(232,255,71,0.3); padding: 2px 6px; border-radius: 10px; margin-left: 6px; }
  .steal-tag { font-family: var(--font-m); font-size: 10px; color: #7c6dfa; background: rgba(124,109,250,0.08); border: 1px solid rgba(124,109,250,0.2); border-radius: 4px; padding: 2px 7px; margin-top: 6px; display: inline-block; }
  .watch-form-inline { padding: 16px 20px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); margin: 0 24px 16px; }
  .watch-btn-wrap { position: relative; }
  .watch-btn-wrap .watch-tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: #1c1c20; color: var(--text); font-size: 11px; font-family: var(--font-m); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); max-width: 220px; text-align: center; white-space: normal; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 10; }
  .watch-btn-wrap:hover .watch-tooltip { opacity: 1; }
  .btn-updates { background: var(--accent-dim); border: 1px solid var(--accent); color: var(--accent); border-radius: 8px; padding: 9px 16px; font-family: var(--font-d); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .btn-updates:hover { background: rgba(232,255,71,0.12); }
  .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; animation: pulseDot 1.5s ease-in-out infinite; }
  @keyframes pulseDot { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.4); } }
  .nav-badge { background: var(--accent); color: #090909; font-family: var(--font-m); font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 10px; margin-left: 6px; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--accent); color: var(--text); padding: 12px 20px; border-radius: var(--radius); font-size: 14px; z-index: 2000; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.4s ease; }
  @media (max-width: 860px) { .hero-split { grid-template-columns: 1fr; gap: 36px; } .hero-right { position: static; } }
  @media (max-width: 640px) { .page { padding: 0 18px 100px; } .nav-links { display: none; } .nav-right .btn-primary { padding: 10px 18px; font-size: 13px; } .steps { grid-template-columns: 1fr; } .step:not(:last-child) { border-right: none; border-bottom: 1px solid var(--border); } .form-card { padding: 22px 18px; } .form-footer { flex-direction: column; align-items: stretch; } .radio-group { flex-direction: column; } .report-header { flex-direction: column; } .modal-actions { flex-wrap: wrap; } }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body > * { display: none !important; }
    .modal-overlay { display: block !important; position: static !important; background: none !important; }
    .modal-content { display: block !important; position: static !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border-radius: 0 !important; border: none !important; }
    .modal-actions { display: none !important; }
    .modal-close { display: none !important; }
    .view-toggle { display: none !important; }
    .table-outer { width: 100% !important; overflow: visible !important; }
    table { width: 100% !important; table-layout: fixed !important; font-size: 10px !important; }
    td, th { word-wrap: break-word !important; overflow-wrap: break-word !important; padding: 6px 8px !important; }
    th:nth-child(1), td:nth-child(1) { width: 14% !important; }
    th:nth-child(2), td:nth-child(2) { width: 18% !important; }
    th:nth-child(3), td:nth-child(3) { width: 18% !important; }
    th:nth-child(4), td:nth-child(4) { width: 18% !important; }
    th:nth-child(5), td:nth-child(5) { width: 22% !important; }
    th:nth-child(6), td:nth-child(6) { width: 28% !important; }
    tr { page-break-inside: avoid !important; }
    .score-cards { display: flex !important; gap: 12px !important; margin-bottom: 16px !important; }
    .score-card { padding: 10px 16px !important; }
    @page { size: A4 landscape; margin: 15mm; }
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

function scoreColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#facc15";
  return "#f87171";
}

function ReportTable({ data, myProduct }: { data: any; myProduct?: string }) {
  const hasC = data.comps && data.comps.length > 0;
  const firstIsYou = hasC && myProduct && data.comps[0]?.toLowerCase().trim() === myProduct.toLowerCase().trim();
  const scoreItems: { name: string; score: number }[] = data.scores
    ? Object.entries(data.scores).map(([name, score]) => ({ name, score: Number(score) }))
    : data.category_score != null
      ? [{ name: "Overall", score: Number(data.category_score) }]
      : [];
  return (
    <div>
      {data.headline && <div className="headline-band fade-up">{data.headline}</div>}
      {data.sum && <div className="summary-strip fade-up"><strong>Overview — </strong>{data.sum}</div>}
      {scoreItems.length > 0 && (
        <div className="score-cards-row fade-up">
          {scoreItems.map(({ name, score }) => (
            <div key={name} className="score-card">
              <div className="score-card-name">{name}</div>
              <div className="score-card-value" style={{ color: scoreColor(score) }}>{score}</div>
              <div className="score-card-bar">
                <div className="score-card-bar-fill" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`table-outer fade-up${data.sum ? " has-sum" : ""}`}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Dimension</th>
                {hasC ? (
                  <>{data.comps.map((c: string, ci: number) => <th key={c} className={`comp-th${firstIsYou && ci === 0 ? " you-col" : ""}`}>{c}{firstIsYou && ci === 0 && <span className="you-badge">You</span>}</th>)}<th className="wide-th">Key Insight</th><th className="rec-th">Your Move ✦</th></>
                ) : (
                  <><th className="wide-th">Current Pattern</th><th>Rating</th><th className="rec-th">Your Move ✦</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {data.secs?.map((sec: any, si: number) => (
                <React.Fragment key={`sec-${si}`}>
                  <tr className="sec-row"><td colSpan={hasC ? data.comps.length + 3 : 4}>{sec.cat}</td></tr>
                  {sec.rows?.map((row: any, ri: number) => (
                    <tr key={`${si}-${ri}`}>
                      <td className="dim-cell">{row.dim}</td>
                      {hasC ? (
                        <>{data.comps.map((c: string, ci: number) => { const s = row.sc?.[c] || {}; return <td key={c} className={`score-cell${firstIsYou && ci === 0 ? " you-col" : ""}`}><div className="score-block"><RatingBadge rating={s.r} />{s.n && <span className="score-note">{s.n}</span>}</div></td>; })}<td className="text-cell">{row.ins}</td><td className="rec-cell"><div>{row.rec}{row.steal && <div className="steal-tag">💡 {row.steal}</div>}</div></td></>
                      ) : (
                        <><td className="text-cell">{row.find}</td><td className="score-cell"><RatingBadge rating={row.r} /></td><td className="rec-cell"><div>{row.rec}{row.steal && <div className="steal-tag">💡 {row.steal}</div>}</div></td></>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {data.opp && <div className="opp-band"><span className="opp-label">Gap</span><span className="opp-text">{data.opp}</span></div>}
      </div>
    </div>
  );
}

const RATING_COLORS: Record<string, string> = {
  Excellent: "#4ade80",
  Good: "#a3e635",
  Average: "#facc15",
  Poor: "#f97316",
  Weak: "#f87171",
};

function HeatmapView({ data, myProduct }: { data: any; myProduct?: string }) {
  const hasC = data.comps && data.comps.length > 0;
  const cols = hasC ? data.comps : ["Industry"];
  const firstIsYou = hasC && myProduct && cols[0]?.toLowerCase().trim() === myProduct.toLowerCase().trim();
  const flatRows: { dim: string; row: any }[] = [];
  data.secs?.forEach((sec: any) => {
    sec.rows?.forEach((row: any) => {
      flatRows.push({ dim: row.dim, row });
    });
  });
  const getCellRating = (row: any, col: string): string => {
    if (hasC) return row.sc?.[col]?.r || "";
    return row.r || "";
  };
  return (
    <div>
      {data.headline && <div className="headline-band fade-up">{data.headline}</div>}
      {data.sum && <div className="summary-strip fade-up"><strong>Overview — </strong>{data.sum}</div>}
      {(() => {
        const scoreItems: { name: string; score: number }[] = data.scores
          ? Object.entries(data.scores).map(([name, score]) => ({ name, score: Number(score) }))
          : data.category_score != null
            ? [{ name: "Overall", score: Number(data.category_score) }]
            : [];
        return scoreItems.length > 0 ? (
          <div className="score-cards-row fade-up">
            {scoreItems.map(({ name, score }) => (
              <div key={name} className="score-card">
                <div className="score-card-name">{name}</div>
                <div className="score-card-value" style={{ color: scoreColor(score) }}>{score}</div>
                <div className="score-card-bar">
                  <div className="score-card-bar-fill" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null;
      })()}
      <div className="heatmap-grid fade-up" style={{ gridTemplateColumns: `minmax(100px, auto) repeat(${cols.length}, minmax(80px, 1fr))` }}>
        <div className="heatmap-header" style={{ gridColumn: 1 }} />
        {cols.map((c: string, ci: number) => (
          <div key={c} className={`heatmap-header${firstIsYou && ci === 0 ? " you-col" : ""}`}>{c}{firstIsYou && ci === 0 && <span className="you-badge" style={{ marginLeft: 6 }}>You</span>}</div>
        ))}
        {flatRows.map((r, ri) => (
          <React.Fragment key={ri}>
            <div className="heatmap-header" style={{ justifyContent: "flex-start" }}>{r.dim}</div>
            {cols.map((colKey: string, ci: number) => {
              const rating = getCellRating(r.row, colKey);
              const bg = RATING_COLORS[rating] || "var(--surface2)";
              const isYouCol = firstIsYou && ci === 0;
              return (
                <div key={colKey} className={`heatmap-cell${isYouCol ? " you-col" : ""}`} style={{ background: isYouCol ? "var(--accent-dim)" : bg, color: rating ? "#090909" : "var(--text-muted)" }}>
                  {rating || "—"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {data.opp && <div className="opp-band" style={{ marginTop: 16 }}><span className="opp-label">Gap</span><span className="opp-text">{data.opp}</span></div>}
    </div>
  );
}

function TourTooltip({ 
  step, 
  total, 
  title, 
  description, 
  onNext, 
  onSkip, 
  targetRef, 
  isLast,
  currentStep 
}: { 
  step: number; 
  total: number; 
  title: string; 
  description: string; 
  onNext: () => void; 
  onSkip: () => void; 
  targetRef: React.RefObject<any>; 
  isLast: boolean; 
  currentStep: number;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, arrow: "top" as "top" | "bottom" | "left" | "right" });

  useEffect(() => {
    const updatePosition = () => {
      const target = targetRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 120;
      const padding = 20;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom + padding;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      let arrow: "top" | "bottom" | "left" | "right" = "top";

      // Check if tooltip goes off right edge
      if (left + tooltipWidth > viewportWidth - padding) {
        left = rect.right - tooltipWidth;
        if (left < padding) left = padding;
      }
      // Check if tooltip goes off left edge
      else if (left < padding) {
        left = padding;
      }

      // Check if tooltip goes off bottom edge
      if (top + tooltipHeight > viewportHeight - padding) {
        // Try to position above
        top = rect.top - tooltipHeight - padding;
        arrow = "bottom";
      }

      // If still off screen, position to the side
      if (top < padding) {
        left = rect.right + padding;
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        arrow = "left";
        
        if (left + tooltipWidth > viewportWidth - padding) {
          left = rect.left - tooltipWidth - padding;
          arrow = "right";
        }
      }

      setPosition({ top, left, arrow });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetRef]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Add highlight ring
    target.style.boxShadow = "0 0 0 4px var(--accent)";
    target.style.transition = "box-shadow 0.2s";

    return () => {
      // Remove highlight ring
      target.style.boxShadow = "";
    };
  }, [targetRef, currentStep]);

  return (
    <>
      <div 
        className="tour-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={onSkip}
      />
      <div
        className="tour-tooltip"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          zIndex: 9999,
          background: "#1c1c20",
          border: "1px solid var(--border-hover)",
          borderRadius: "12px",
          padding: "16px 20px",
          maxWidth: "260px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ fontFamily: "var(--font-m)", fontSize: "10px", color: "var(--text-dim)", marginBottom: "8px" }}>
          {step} of {total}
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", fontFamily: "var(--font-d)", marginBottom: "8px" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
          {description}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn-primary"
            style={{ 
              padding: "8px 16px", 
              fontSize: "12px",
              background: "var(--accent)",
              color: "#090909",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              fontFamily: "var(--font-d)",
            }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >
            {isLast ? "Get Started →" : "Next →"}
          </button>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "var(--font-m)",
            }}
            onClick={(e) => { e.stopPropagation(); onSkip(); }}
          >
            Skip tour
          </button>
        </div>
        {position.arrow === "top" && (
          <div style={{
            position: "absolute",
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid #1c1c20",
          }} />
        )}
        {position.arrow === "bottom" && (
          <div style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid #1c1c20",
          }} />
        )}
        {position.arrow === "left" && (
          <div style={{
            position: "absolute",
            left: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid #1c1c20",
          }} />
        )}
        {position.arrow === "right" && (
          <div style={{
            position: "absolute",
            right: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "8px solid #1c1c20",
          }} />
        )}
      </div>
    </>
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
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [industry, setIndustry] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [depth, setDepth] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [pendingReportData, setPendingReportData] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [reportViewMode, setReportViewMode] = useState<"table" | "heatmap">("table");
  const [analysisMode, setAnalysisMode] = useState<"competitor" | "myProduct">("competitor");
  const [myProduct, setMyProduct] = useState("");
  const [showWatchForm, setShowWatchForm] = useState(false);
  const [watchEmail, setWatchEmail] = useState("");
  const [watchFrequency, setWatchFrequency] = useState<"Weekly" | "Monthly">("Weekly");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [sendNowId, setSendNowId] = useState<string | null>(null);
  const effectiveCategory = industry === "custom" ? customCategory : industry;
  const canSubmit = !loading && (industry === "custom" ? customCategory.trim().length > 0 : industry.length > 0) && (analysisMode !== "myProduct" || myProduct.trim().length > 0);

  // Refs for tour targets
  const industryRef = useRef<HTMLDivElement>(null);
  const competitorsRef = useRef<HTMLTextAreaElement>(null);
  const focusAreasRef = useRef<HTMLTextAreaElement>(null);
  const generateBtnRef = useRef<HTMLButtonElement>(null);

  const tourSteps = [
    {
      title: "Pick your industry",
      description: "Choose from 30+ categories or type your own niche",
      target: industryRef,
    },
    {
      title: "Add competitors", 
      description: "Name up to 3 products you want to benchmark against",
      target: competitorsRef,
    },
    {
      title: "Set focus areas",
      description: "Optional — tell AI which UX dimensions matter most to you", 
      target: focusAreasRef,
    },
    {
      title: "Generate your report",
      description: "Get instant scores, heatmaps and actionable recommendations",
      target: generateBtnRef,
    },
  ];

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (showWatchForm && typeof window !== "undefined") {
      setWatchEmail(localStorage.getItem(EMAIL_STORAGE_KEY) || "");
    }
  }, [showWatchForm]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasToured = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasToured) {
        setShowTour(true);
        setTourStep(0);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      }
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  };

  const saveToHistory = (data: any) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      category: effectiveCategory,
      competitors,
      depth,
      reportData: data,
      createdAt: new Date().toISOString(),
    };
    
    const currentHistory = loadHistory();
    const updatedHistory = [newItem, ...currentHistory].slice(0, 10);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const deleteHistoryItem = (id: string) => {
    const currentHistory = loadHistory();
    const updatedHistory = currentHistory.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const viewHistoryReport = (item: HistoryItem) => {
    setReportData(item.reportData);
    setShowHistoryModal(false);
  };

  const rerunAnalysis = (item: HistoryItem) => {
    setShowHistoryModal(false);
    setIndustry(item.category);
    setCompetitors(item.competitors);
    setDepth(item.depth);
    // Scroll to form
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  const handleStartWatching = () => {
    const email = watchEmail.trim();
    if (!email) return;
    const item: WatchlistItem = {
      id: crypto.randomUUID(),
      category: effectiveCategory,
      competitors,
      depth,
      email,
      frequency: watchFrequency,
      savedAt: new Date().toISOString(),
      reportData: reportData,
    };
    const next = [...watchlist, item];
    setWatchlist(next);
    saveWatchlist(next);
    setShowWatchForm(false);
    setToastMsg("Watching this space ✓ — we'll email you updates");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRemoveWatchlist = (id: string) => {
    const next = watchlist.filter((w) => w.id !== id);
    setWatchlist(next);
    saveWatchlist(next);
  };

  const handleSendNow = async (item: WatchlistItem) => {
    setSendNowId(item.id);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: item.email, 
          category: item.category, 
          competitors: item.competitors, 
          depth: item.depth, 
          reportData: item.reportData 
        }),
      });
      const data = await res.json();
      if (data.success) setToastMsg("Report sent to your email ✓");
      else setToastMsg("Failed to send — try again");
    } catch (err: any) {
      console.error("Send now error:", err);
      setToastMsg("Failed to send — try again");
    }
    setTimeout(() => { setToastMsg(""); setSendNowId(null); }, 3000);
  };

  useEffect(() => {
    const reportParam = searchParams.get("report");
    if (reportParam) {
      try {
        const decoded = JSON.parse(atob(reportParam));
        if (decoded && (decoded.secs || decoded.sum)) {
          setReportData(decoded);
          setShared(true);
        }
      } catch {
        // ignore invalid report param
      }
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!effectiveCategory.trim()) return;
    setLoading(true); setErrorMsg(""); setReportData(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(effectiveCategory, competitors, depth, focusAreas, analysisMode === "myProduct" ? myProduct : undefined) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text: raw } = await res.json();
      const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error(`No JSON found.`);
      const data = JSON.parse(raw.slice(start, end + 1));
      
      // Save to history
      saveToHistory(data);
      
      if (typeof window !== "undefined" && localStorage.getItem(EMAIL_STORAGE_KEY)) {
        setReportData(data);
      } else {
        setPendingReportData(data);
        setShowEmailModal(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error.");
    } finally { setLoading(false); }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(JSON.stringify(reportData, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleShareReport = async () => {
    const encoded = btoa(JSON.stringify(reportData));
    const url = new URL(window.location.href);
    url.searchParams.set("report", encoded);
    await navigator.clipboard.writeText(url.toString());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };
  const handleEmailSubmit = () => {
    const email = emailInput.trim();
    if (!email) return;
    if (typeof window !== "undefined") localStorage.setItem(EMAIL_STORAGE_KEY, email);
    fetch("/api/welcome", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => {});
    fetch("https://script.google.com/macros/s/AKfycbw5j4DrGmxOef2CCtJ-M7mcEc-F50-Tu1oA_uXSAsVUwFFoIzbXO20WbPGSlJQoSo5p/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setReportData(pendingReportData);
    setPendingReportData(null);
    setShowEmailModal(false);
    setEmailInput("");
  };
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
              <span className="nav-link" onClick={() => setShowHistoryModal(true)} style={{ display: "flex", alignItems: "center" }}>History{history.length > 0 && <span className="nav-badge" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>{history.length}</span>}</span>
              <span className="nav-link" onClick={() => setShowWatchlistModal(true)} style={{ display: "flex", alignItems: "center" }}>Watchlist{watchlist.length > 0 && <span className="nav-badge">{watchlist.length}</span>}</span>
            </div>
            <div className="theme-toggle">
              <button type="button" className={`theme-toggle-option${theme === "dark" ? " active" : ""}`} onClick={() => setTheme("dark")}>Dark</button>
              <button type="button" className={`theme-toggle-option${theme === "light" ? " active" : ""}`} onClick={() => setTheme("light")}>Light</button>
            </div>
            <button type="button" className="btn-primary" onClick={scrollToForm}>Get Started Free →</button>
          </div>
        </nav>

        <section className="hero-section">
          <div className="hero-split">
            <div className="hero-left">
              <div className="hero-kicker">AI-powered UX intelligence</div>
              <h1 className="hero-h1">Know where your<br /><em>competitors</em><br />are failing</h1>
              <p className="hero-sub">Instant structured teardowns, UX scoring, heatmaps and weekly monitoring for any product category. Built for designers and agencies who move fast.</p>
              <div className="hero-trust">
                <span className="trust-item">⚡ Results in ~10s</span><span className="trust-sep">·</span>
                <span className="trust-item">30+ industries</span><span className="trust-sep">·</span>
                <span className="trust-item">UX Scoring</span><span className="trust-sep">·</span>
                <span className="trust-item">Weekly Alerts</span><span className="trust-sep">·</span>
                <span className="trust-item">Free · No signup</span>
              </div>
            </div>
            <div className="hero-right" id="form">
              <div className="form-card">
                <div className="form-row">
                  <div className="view-toggle" style={{ marginBottom: 0 }}>
                    <button type="button" className={`view-toggle-btn${analysisMode === "competitor" ? " active" : ""}`} onClick={() => setAnalysisMode("competitor")}>Competitor Analysis</button>
                    <button type="button" className={`view-toggle-btn${analysisMode === "myProduct" ? " active" : ""}`} onClick={() => setAnalysisMode("myProduct")}>My Product vs Market</button>
                  </div>
                </div>
                {analysisMode === "myProduct" && (
                  <div className="form-row">
                    <span className="field-label">Your Product Name</span>
                    <input type="text" placeholder="e.g. MyApp, Payonus, Kuda" value={myProduct} onChange={(e) => setMyProduct(e.target.value)} style={{ width: "100%" }} />
                  </div>
                )}
                <div className="form-row">
                  <span className="field-label">Industry or Niche</span>
                  <div ref={industryRef}>
                    <IndustryDropdown value={industry} customValue={customCategory} onChange={setIndustry} onCustomChange={setCustomCategory} />
                  </div>
                </div>
                <div className="form-row">
                  <span className="field-label">Competitors <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional · up to 3)</span></span>
                  <textarea ref={competitorsRef} placeholder={"Paystack\nFlutterwave\nStripe"} value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="field-label">Focus Areas <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional)</span></span>
                  <textarea ref={focusAreasRef} placeholder="e.g. checkout flow, empty states, error handling" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} />
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
                  <button className="btn-primary" ref={generateBtnRef} onClick={handleGenerate} disabled={!canSubmit}>{loading ? "Analyzing..." : "Generate Analysis →"}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading && <div className="loading-state"><div className="loading-spinner" /><div className="loading-label"><span className="loading-dots">Analyzing UX patterns</span></div></div>}
        {errorMsg && !loading && <div className="error-state"><span className="error-icon">⚠</span><div><div className="error-title">Analysis failed</div><div className="error-msg">{errorMsg}</div></div></div>}
        {showEmailModal && pendingReportData && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <div className="modal-header" style={{ padding: "24px 24px 0" }}>
                <div className="report-title" style={{ marginBottom: 8 }}>Get your free report</div>
                <p className="form-hint" style={{ marginBottom: 24 }}>Join 100+ designers getting UX insights</p>
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <div className="form-row">
                  <span className="field-label">Email</span>
                  <input type="email" placeholder="you@company.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontFamily: "var(--font-d)", fontSize: 15, padding: "13px 16px", outline: "none" }} />
                </div>
                <button type="button" className="btn-primary" onClick={handleEmailSubmit} disabled={!emailInput.trim()} style={{ width: "100%", marginTop: 8 }}>Get My Report →</button>
              </div>
            </div>
          </div>
        )}
        {reportData && !loading && (
          <div className="modal-overlay" onClick={() => setReportData(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setReportData(null)} aria-label="Close">×</button>
              <div className="modal-header">
                <div className="report-header">
                  <div className="report-title-block">
                    <div className="report-label">// analysis complete</div>
                    <div className="report-title">{effectiveCategory || (reportData?.sum ? reportData.sum.slice(0, 60) + (reportData.sum.length > 60 ? "…" : "") : "Shared Report")}</div>
                    <div className="report-meta">{depth === "quick" ? "Quick Scan" : "Deep Teardown"}{reportData.comps?.length > 0 && ` · comparing ${reportData.comps.join(", ")}`}</div>
                  </div>
                </div>
              </div>
              <div className="modal-scroll">
                <div className="view-toggle">
                  <button type="button" className={`view-toggle-btn${reportViewMode === "table" ? " active" : ""}`} onClick={() => setReportViewMode("table")}>Table View</button>
                  <button type="button" className={`view-toggle-btn${reportViewMode === "heatmap" ? " active" : ""}`} onClick={() => setReportViewMode("heatmap")}>Heatmap View</button>
                </div>
                {reportViewMode === "table" ? <ReportTable data={reportData} myProduct={analysisMode === "myProduct" ? myProduct : undefined} /> : <HeatmapView data={reportData} myProduct={analysisMode === "myProduct" ? myProduct : undefined} />}
                <div className="form-hint" style={{ marginTop: 32, textAlign: "center" }}>Generated by UXRival.com — Free AI UX Analysis</div>
              </div>
              {showWatchForm && (
                <div className="watch-form-inline">
                  <div className="form-row">
                    <span className="field-label">Email</span>
                    <input type="email" placeholder="you@company.com" value={watchEmail} onChange={(e) => setWatchEmail(e.target.value)} style={{ width: "100%" }} />
                  </div>
                  <div className="form-row" style={{ marginBottom: 16 }}>
                    <span className="field-label">Frequency</span>
                    <div className="view-toggle" style={{ marginBottom: 0 }}>
                      <button type="button" className={`view-toggle-btn${watchFrequency === "Weekly" ? " active" : ""}`} onClick={() => setWatchFrequency("Weekly")}>Weekly</button>
                      <button type="button" className={`view-toggle-btn${watchFrequency === "Monthly" ? " active" : ""}`} onClick={() => setWatchFrequency("Monthly")}>Monthly</button>
                    </div>
                  </div>
                  <button type="button" className="btn-primary" onClick={handleStartWatching} disabled={!watchEmail.trim()}>Start Watching →</button>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleExportPdf}>Export as PDF</button>
                <button type="button" className="btn-secondary" onClick={handleShareReport}>{shared ? "✓ Link Copied" : "Share Report"}</button>
                <button type="button" className={`btn-secondary${copied ? " copied" : ""}`} onClick={handleCopy}>{copied ? "✓ Copied" : "Copy JSON"}</button>
                <div className="watch-btn-wrap">
                  {!showWatchForm && <span className="watch-tooltip">Get this analysis re-run and emailed to you weekly or monthly</span>}
                  <button type="button" className={showWatchForm ? "btn-secondary" : "btn-updates"} onClick={() => setShowWatchForm((s) => !s)}>
                    {!showWatchForm && <span className="pulse-dot" />}
                    {showWatchForm ? "Cancel" : "Get Weekly Updates →"}
                  </button>
                </div>
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
                { icon: "⚔️", title: "Side-by-side comparison", desc: "Score up to 3 competitors across key UX dimensions in one report." },
                { icon: "🔥", title: "UX Heatmap", desc: "See ratings as a colour grid — one glance tells the whole story. Perfect for client presentations." },
                { icon: "✦", title: "Steal This Pattern", desc: "Every recommendation includes a real product that does it well. Stop guessing, start stealing." },
                { icon: "📊", title: "UX Scoring", desc: "Every competitor gets a score out of 100. See who's winning and by how much." },
                { icon: "👁", title: "Weekly Monitoring", desc: "Watch any product category and get re-run analyses delivered to your email weekly or monthly." },
                { icon: "🎯", title: "My Product vs Market", desc: "Add your own product to the comparison and see exactly where you win and lose." },
                { icon: "📄", title: "Export & Share", desc: "Export as PDF or share a live report link with clients instantly." },
              ].map((f) => <div key={f.title} className="feature-card"><div className="feature-icon">{f.icon}</div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>)}
            </div>
          </section>
          <section className="section">
            <div className="section-eyebrow">How it works</div>
            <div className="section-title">Three steps to a full UX audit</div>
            <div className="steps-wrap" style={{ marginTop: 40 }}>
              <div className="steps">
                {[
                  { n: "01", title: "Pick your industry", desc: "Select from 30+ categories or type your own. Add up to 3 competitors or your own product." },
                  { n: "02", title: "Customise your analysis", desc: "Choose depth, set focus areas, and switch between competitor mode or my product mode." },
                  { n: "03", title: "Get your report", desc: "See scores, heatmap, steal-worthy patterns and Your Move recommendations. Export or share instantly." },
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
                { accent: "Startups", desc: "Benchmark your product against established players before you ship. Know where you stand from day one." },
              ].map((a) => <div key={a.accent} className="audience-card"><div className="audience-role"><span>{a.accent}</span></div><div className="audience-desc">{a.desc}</div></div>)}
            </div>
          </section>
        </div>

        <footer className="site-footer">
          <div className="footer-logo">UX<span>Rival</span></div>
          <div className="footer-copy">Built for designers who ship · Powered by Claude</div>
        </footer>
      </div>

      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <button type="button" className="modal-close" onClick={() => setShowHistoryModal(false)} aria-label="Close">×</button>
            <div className="modal-header">
              <div className="report-title">Analysis History</div>
            </div>
            <div className="modal-scroll">
              {history.length === 0 ? (
                <p className="form-hint" style={{ padding: 24 }}>No analyses saved yet. Run your first analysis to see it here.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.map((item) => (
                    <div key={item.id} className="feature-card" style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="report-title" style={{ fontSize: 15, marginBottom: 6 }}>{item.category}</div>
                          {item.competitors.trim() && <div className="form-hint" style={{ marginBottom: 6 }}>{item.competitors.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean).join(", ") || "—"}</div>}
                          <div className="form-hint" style={{ fontSize: 11, color: "var(--text-dim)" }}>{getTimeAgo(item.createdAt)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button type="button" className="btn-secondary" onClick={() => viewHistoryReport(item)}>View Report</button>
                          <button type="button" className="btn-secondary" onClick={() => rerunAnalysis(item)}>Re-run</button>
                          <button type="button" className="btn-secondary" onClick={() => deleteHistoryItem(item.id)} style={{ padding: "8px 12px", fontSize: 14 }}>🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="form-hint" style={{ marginTop: 24, textAlign: "center", fontSize: 11 }}>History is saved on this device only</p>
            </div>
          </div>
        </div>
      )}

      {showWatchlistModal && (
        <div className="modal-overlay" onClick={() => setShowWatchlistModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <button type="button" className="modal-close" onClick={() => setShowWatchlistModal(false)} aria-label="Close">×</button>
            <div className="modal-header">
              <div className="report-title">Competitor Watchlist</div>
            </div>
            <div className="modal-scroll">
              {watchlist.length === 0 ? (
                <div style={{ padding: "60px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "48px", color: "var(--text-dim)" }}>👁</div>
                  <div style={{ fontSize: "18px", fontFamily: "var(--font-d)", fontWeight: "700", marginBottom: "8px" }}>No spaces watched yet</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "320px", lineHeight: "1.5", margin: "0 auto" }}>Run an analysis and click Get Weekly Updates to monitor a product category. We'll email you when things change.</div>
                  <button type="button" className="btn-primary" onClick={() => { setShowWatchlistModal(false); scrollToForm(); }}>Run your first analysis →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {watchlist.map((item) => (
                    <div key={item.id} className="feature-card" style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="report-title" style={{ fontSize: 16, marginBottom: 6 }}>{item.category}</div>
                          {item.competitors.trim() && <div className="form-hint" style={{ marginBottom: 6 }}>Competitors: {item.competitors.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean).join(", ") || "—"}</div>}
                          <div className="form-hint">→ {item.email} · {item.depth === "quick" ? "Quick" : "Deep"}</div>
                          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <span className="nav-pill" style={{ fontSize: 9 }}>{item.frequency}</span>
                            <span className="form-hint" style={{ fontSize: 10 }}>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button type="button" className="btn-secondary" onClick={() => handleSendNow(item)} disabled={sendNowId === item.id}>{sendNowId === item.id ? "Sending…" : "Send Now"}</button>
                          <button type="button" className="btn-secondary" onClick={() => handleRemoveWatchlist(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
      
      {showTour && tourStep < tourSteps.length && (
        <TourTooltip
          step={tourStep + 1}
          total={tourSteps.length}
          title={tourSteps[tourStep].title}
          description={tourSteps[tourStep].description}
          onNext={handleTourNext}
          onSkip={handleTourSkip}
          targetRef={tourSteps[tourStep].target}
          isLast={tourStep === tourSteps.length - 1}
          currentStep={tourStep}
        />
      )}
    </>
  );
}