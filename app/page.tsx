'use client';
import React, { useState } from 'react';

export default function Home() {
const [input, setInput] = useState('');
const [result, setResult] = useState('');
const [loading, setLoading] = useState(false);

const handleAnalyze = async () => {
setLoading(true);
setResult('');
try {
const res = await fetch('/api/analyze', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ prompt: input }),
});
const data = await res.json();
setResult(data.text || data.error || 'No response received.');
} catch (err) {
setResult('Error connecting to the analysis engine.');
}
setLoading(false);
};

return (
<main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
<h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>UX Rival</h1>
<p style={{ color: '#666', marginBottom: '30px' }}>Enter a UI scenario or copy-paste a landing page description for a quick UX audit.</p>

  <textarea 
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="e.g., Analyze the checkout flow of a grocery app where users forget to add coupons..."
    style={{ width: '100%', height: '150px', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
  />
  
  <button 
    onClick={handleAnalyze} 
    disabled={loading || !input}
    style={{ 
      padding: '12px 24px', 
      cursor: loading ? 'not-allowed' : 'pointer', 
      background: '#0070f3', 
      color: 'white', 
      border: 'none', 
      borderRadius: '6px',
      fontWeight: 'bold',
      opacity: loading || !input ? 0.6 : 1
    }}
  >
    {loading ? 'Analyzing with Gemini...' : 'Run UX Audit'}
  </button>
  
  {result && (
    <div style={{ marginTop: '40px', padding: '25px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <h3 style={{ marginTop: 0 }}>Analysis Result:</h3>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{result}</div>
    </div>
  )}
</main>
);
}