let currentDepth = 'quick';
let currentReportData = null;
let currentSiteName = '';
let currentCategory = '';

// Auto-detect site and start analysis
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      const hostname = url.hostname.replace('www.', '');
      currentSiteName = capitalize(hostname.split('.')[0]);
      document.getElementById('siteName').textContent = currentSiteName;
      document.getElementById('siteUrl').textContent = hostname;
      
      // Auto-detect industry from hostname
      const detected = detectIndustry(hostname);
      document.getElementById('industry').value = detected;
      
      // Pre-fill competitor with current site
      document.getElementById('competitors').value = currentSiteName;
    } catch(e) {
      document.getElementById('siteName').textContent = 'Current site';
    }
  }
});

function detectIndustry(hostname) {
  const map = {
    'substack': 'social media platform',
    'twitter': 'social media platform',
    'x.com': 'social media platform',
    'linkedin': 'social media platform',
    'instagram': 'social media platform',
    'facebook': 'social media platform',
    'paystack': 'fintech',
    'flutterwave': 'fintech',
    'stripe': 'fintech',
    'kuda': 'fintech',
    'opay': 'fintech',
    'revolut': 'fintech',
    'wise': 'fintech',
    'notion': 'project management tool',
    'asana': 'project management tool',
    'linear': 'project management tool',
    'trello': 'project management tool',
    'figma': 'design tool for teams',
    'canva': 'design tool for teams',
    'zoom': 'video conferencing tool',
    'meet': 'video conferencing tool',
    'teams': 'video conferencing tool',
    'shopify': 'e-commerce marketplace',
    'amazon': 'e-commerce marketplace',
    'spotify': 'music streaming service',
    'netflix': 'video streaming service',
    'uber': 'ride-sharing app',
    'bolt': 'ride-sharing app',
  };
  
  for (const [key, value] of Object.entries(map)) {
    if (hostname.includes(key)) return value;
  }
  return '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function setDepth(depth) {
  currentDepth = depth;
  document.getElementById('quickBtn').className = 'depth-btn' + (depth === 'quick' ? ' active' : '');
  document.getElementById('deepBtn').className = 'depth-btn' + (depth === 'deep' ? ' active' : '');
}

document.getElementById('industry').addEventListener('change', function() {
  document.getElementById('customWrap').style.display = this.value === 'custom' ? 'block' : 'none';
});

async function analyze() {
  const industry = document.getElementById('industry').value;
  const customCat = document.getElementById('customCategory').value.trim();
  const category = industry === 'custom' ? customCat : industry;
  const competitorsRaw = document.getElementById('competitors').value.trim();
  const competitors = competitorsRaw
    ? competitorsRaw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
    : [currentSiteName];

  // If no category selected use a generic one based on site name
  currentCategory = category || currentSiteName + ' category';

  document.getElementById('errorMsg').style.display = 'none';
  showLoading();

  const dots = ['Analyzing UX patterns', 'Scoring competitors', 'Finding opportunities', 'Building your report'];
  let di = 0;
  const interval = setInterval(() => {
    di = (di + 1) % dots.length;
    const el = document.getElementById('loadingText');
    if (el) el.textContent = dots[di] + '...';
  }, 2000);

  try {
    const res = await fetch('https://uxrival.xyz/api/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: currentCategory,
        competitors,
        depth: currentDepth,
        focusAreas: ''
      })
    });

    clearInterval(interval);
    if (!res.ok) throw new Error('Analysis failed');
    const data = await res.json();
    currentReportData = data;
    showResult(data);
  } catch(err) {
    clearInterval(interval);
    showForm();
    showError('Analysis failed — check your connection and try again');
  }
}

function showResult(data) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('resultView').style.display = 'block';
  document.getElementById('resultTitle').textContent = currentCategory;

  let html = '';

  if (data.headline) {
    html += `<div class="headline">${data.headline}</div>`;
  }

  if (data.scores) {
    html += '<div class="score-row">';
    Object.entries(data.scores).forEach(([name, score]) => {
      const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
      html += `<div class="score-card">
        <div class="score-name">${name}</div>
        <div class="score-val" style="color:${color}">${score}</div>
      </div>`;
    });
    html += '</div>';
  }

  if (data.secs && data.secs.length > 0) {
    html += '<div style="margin-top:12px">';
    data.secs.forEach(sec => {
      html += `<div style="font-family:monospace;font-size:9px;color:#66666f;text-transform:uppercase;letter-spacing:0.1em;margin:10px 0 6px">${sec.cat}</div>`;
      sec.rows && sec.rows.forEach(row => {
        html += `<div style="background:#17171a;border:1px solid #212126;border-radius:8px;padding:8px 10px;margin-bottom:6px">
          <div style="font-size:11px;color:#a0a0b0;margin-bottom:4px;font-weight:600">${row.dim}</div>
          <div style="font-size:11px;color:#6a6a80;line-height:1.4">${row.rec || ''}</div>
        </div>`;
      });
    });
    html += '</div>';
  }

  if (data.opp) {
    html += `<div class="opp">
      <div class="opp-label">Market Gap</div>
      <div class="opp-text">${data.opp}</div>
    </div>`;
  }

  document.getElementById('resultContent').innerHTML = html;
}

function showForm() {
  document.getElementById('formView').style.display = 'block';
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('resultView').style.display = 'none';
}

function showLoading() {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('loadingView').style.display = 'block';
  document.getElementById('resultView').style.display = 'none';
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.style.display = 'block';
}

function copyJSON() {
  if (currentReportData) {
    navigator.clipboard.writeText(JSON.stringify(currentReportData, null, 2));
  }
}

function openFull() {
  chrome.tabs.create({ url: 'https://uxrival.xyz' });
}
