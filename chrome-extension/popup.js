let currentDepth = 'quick';
let currentReportData = null;
let currentSiteName = '';
let currentCategory = '';

function init() {
  var quickBtn = document.getElementById('quickBtn');
  var deepBtn = document.getElementById('deepBtn');
  var analyzeBtn = document.getElementById('analyzeBtn');
  var openFullBtn = document.getElementById('openFullBtn');
  var openFullBtn2 = document.getElementById('openFullBtn2');
  var backBtn = document.getElementById('backBtn');
  var copyBtn = document.getElementById('copyBtn');
  var industrySelect = document.getElementById('industry');

  quickBtn.addEventListener('click', function() {
    currentDepth = 'quick';
    quickBtn.classList.add('active');
    deepBtn.classList.remove('active');
  });

  deepBtn.addEventListener('click', function() {
    currentDepth = 'deep';
    deepBtn.classList.add('active');
    quickBtn.classList.remove('active');
  });

  analyzeBtn.addEventListener('click', analyze);
  openFullBtn.addEventListener('click', openFull);
  if (openFullBtn2) openFullBtn2.addEventListener('click', openFullReport);
  if (backBtn) backBtn.addEventListener('click', showForm);
  if (copyBtn) copyBtn.addEventListener('click', copyJSON);

  industrySelect.addEventListener('change', function() {
    var customWrap = document.getElementById('customWrap');
    customWrap.style.display = this.value === 'custom' ? 'block' : 'none';
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    if (tab && tab.url) {
      try {
        var url = new URL(tab.url);
        var hostname = url.hostname.replace('www.', '');
        currentSiteName = hostname.split('.')[0];
        currentSiteName = currentSiteName.charAt(0).toUpperCase() + currentSiteName.slice(1);
        document.getElementById('siteName').textContent = currentSiteName;
        document.getElementById('siteUrl').textContent = hostname;
        var detected = detectIndustry(hostname);
        if (detected) document.getElementById('industry').value = detected;
      } catch(e) {
        document.getElementById('siteName').textContent = 'Current site';
      }
    }
  });
}

function detectIndustry(hostname) {
  var map = {
    'substack': 'social media platform',
    'twitter': 'social media platform',
    'linkedin': 'social media platform',
    'instagram': 'social media platform',
    'paystack': 'fintech',
    'flutterwave': 'fintech',
    'stripe': 'fintech',
    'kuda': 'fintech',
    'opay': 'fintech',
    'revolut': 'fintech',
    'notion': 'project management tool',
    'asana': 'project management tool',
    'figma': 'design tool for teams',
    'canva': 'design tool for teams',
    'zoom': 'video conferencing tool',
    'chowdeck': 'food delivery platform',
    'jumia': 'food delivery platform',
    'glovo': 'food delivery platform',
    'uber': 'ride-sharing app',
    'bolt': 'ride-sharing app',
    'spotify': 'music streaming service',
    'netflix': 'video streaming service'
  };
  for (var key in map) {
    if (hostname.indexOf(key) !== -1) return map[key];
  }
  return '';
}

function analyze() {
  var industry = document.getElementById('industry').value;
  var customCat = document.getElementById('customCategory').value.trim();
  var category = industry === 'custom' ? customCat : industry;
  var competitorsRaw = document.getElementById('competitors').value.trim();
  var competitors = competitorsRaw
    ? competitorsRaw.split('\n').map(function(s) { return s.trim(); }).filter(Boolean)
    : [currentSiteName];

  currentCategory = category || currentSiteName;
  document.getElementById('errorMsg').style.display = 'none';
  showLoading();

  var dots = ['Analyzing UX patterns', 'Scoring competitors', 'Finding opportunities', 'Building your report'];
  var di = 0;
  var interval = setInterval(function() {
    di = (di + 1) % dots.length;
    var el = document.getElementById('loadingText');
    if (el) el.textContent = dots[di] + '...';
  }, 2000);

  fetch('https://uxrival.xyz/api/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: currentCategory,
      competitors: competitors,
      depth: currentDepth,
      focusAreas: ''
    })
  })
  .then(function(res) {
    clearInterval(interval);
    if (!res.ok) throw new Error('Analysis failed');
    return res.json();
  })
  .then(function(data) {
    currentReportData = data;
    showResult(data);
  })
  .catch(function(err) {
    clearInterval(interval);
    showForm();
    document.getElementById('errorMsg').textContent = 'Analysis failed — check connection and try again';
    document.getElementById('errorMsg').style.display = 'block';
  });
}

function showResult(data) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('loadingView').style.display = 'none';
  document.getElementById('resultView').style.display = 'block';
  document.getElementById('resultTitle').textContent = currentCategory;

  var html = '';

  if (data.headline) {
    html += '<div class="headline">' + data.headline + '</div>';
  }

  if (data.scores) {
    html += '<div class="score-row">';
    for (var name in data.scores) {
      var score = data.scores[name];
      var color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
      html += '<div class="score-card"><div class="score-name">' + name + '</div><div class="score-val" style="color:' + color + '">' + score + '</div></div>';
    }
    html += '</div>';
  }

  if (data.secs && data.secs.length > 0) {
    html += '<div style="margin-top:12px">';
    data.secs.forEach(function(sec) {
      html += '<div style="font-family:monospace;font-size:9px;color:#66666f;text-transform:uppercase;letter-spacing:0.1em;margin:10px 0 6px;padding:6px 8px;background:#0f0f12;border-radius:4px">' + sec.cat + '</div>';
      if (sec.rows) {
        sec.rows.forEach(function(row) {
          html += '<div style="background:#17171a;border:1px solid #212126;border-radius:8px;padding:10px 12px;margin-bottom:8px">';
          html += '<div style="font-size:12px;color:#a0a0b0;margin-bottom:6px;font-weight:600">' + row.dim + '</div>';
          if (row.sc) {
            for (var comp in row.sc) {
              var rating = row.sc[comp];
              var rColor = rating.r === 'Excellent' ? '#4ade80' : rating.r === 'Good' ? '#a3e635' : rating.r === 'Average' ? '#facc15' : '#f87171';
              html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
              html += '<span style="font-size:10px;color:#66666f;min-width:70px">' + comp + '</span>';
              html += '<span style="font-size:10px;color:' + rColor + ';font-weight:600">' + rating.r + '</span>';
              html += '</div>';
            }
          }
          if (row.ins) html += '<div style="font-size:10px;color:#66666f;margin-top:6px;line-height:1.4">' + row.ins + '</div>';
          html += '</div>';
        });
      }
    });
    html += '</div>';
  }

  if (data.opp) {
    html += '<div class="opp" style="margin-top:12px"><div class="opp-label">Market Gap</div><div class="opp-text">' + data.opp + '</div></div>';
  }

  document.getElementById('resultContent').innerHTML = html;
}

function openFullReport() {
  if (currentReportData) {
    var encoded = btoa(JSON.stringify(currentReportData));
    chrome.tabs.create({ url: 'https://uxrival.xyz/?report=' + encoded });
  } else {
    chrome.tabs.create({ url: 'https://uxrival.xyz' });
  }
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

function copyJSON() {
  if (currentReportData) navigator.clipboard.writeText(JSON.stringify(currentReportData, null, 2));
}

function openFull() {
  chrome.tabs.create({ url: 'https://uxrival.xyz' });
}

document.addEventListener('DOMContentLoaded', init);
