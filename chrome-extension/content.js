(function() {
  if (document.getElementById('uxrival-panel')) return;

  var currentDepth = 'quick';
  var currentReportData = null;
  var currentSiteName = '';
  var currentCategory = '';
  var analysisMode = 'product';
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  var hostname = window.location.hostname.replace('www.', '');
  var pathname = window.location.pathname;
  currentSiteName = hostname.split('.')[0];
  currentSiteName = currentSiteName.charAt(0).toUpperCase() + currentSiteName.slice(1);

  // Auto detect if this is a landing page or app
  var isLandingPage = pathname === '/' || pathname === '' || pathname === '/index.html';
  var defaultMode = isLandingPage ? 'page' : 'product';
  analysisMode = defaultMode;

  function detectIndustry(h) {
    var map = {
      'substack': 'newsletter platform',
      'twitter': 'social media platform',
      'x.com': 'social media platform',
      'linkedin': 'professional social network',
      'instagram': 'social media platform',
      'facebook': 'social media platform',
      'paystack': 'fintech payment platform',
      'flutterwave': 'fintech payment platform',
      'stripe': 'fintech payment platform',
      'kuda': 'digital banking app',
      'opay': 'mobile money platform',
      'moniepoint': 'business banking platform',
      'revolut': 'digital banking app',
      'notion': 'project management tool',
      'asana': 'project management tool',
      'linear': 'project management tool',
      'trello': 'project management tool',
      'figma': 'design tool',
      'canva': 'design tool',
      'zoom': 'video conferencing tool',
      'chowdeck': 'food delivery platform',
      'jumia': 'food delivery platform',
      'glovo': 'food delivery platform',
      'uber': 'ride-sharing app',
      'bolt': 'ride-sharing app',
      'spotify': 'music streaming service',
      'netflix': 'video streaming service',
      'amazon': 'e-commerce marketplace',
      'shopify': 'e-commerce platform'
    };
    for (var key in map) {
      if (h.indexOf(key) !== -1) return map[key];
    }
    return '';
  }

  var detectedIndustry = detectIndustry(hostname);

  var panel = document.createElement('div');
  panel.id = 'uxrival-panel';
  panel.style.setProperty('display', 'none', 'important');

  panel.innerHTML =
    '<div id="uxrival-header">' +
      '<div class="uxr-logo">UX<span>Rival</span></div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span class="uxr-pill">BETA</span>' +
        '<button class="uxr-close" id="uxr-close">×</button>' +
      '</div>' +
    '</div>' +

    '<div id="uxrival-body">' +
      '<div id="uxr-form">' +

        // Restore banner
        '<div id="uxr-restore-banner" style="display:none;background:#17171a;border:1px solid #e8ff47;border-radius:10px;padding:12px 14px;margin-bottom:14px;align-items:center;justify-content:space-between;gap:8px">' +
          '<span style="font-size:11px;color:#a0a0b0">View your last analysis?</span>' +
          '<div style="display:flex;gap:6px">' +
            '<button type="button" id="uxr-restore-yes" style="background:#e8ff47;color:#090909;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">View</button>' +
            '<button type="button" id="uxr-restore-no" style="background:none;border:1px solid #212126;border-radius:6px;padding:4px 10px;font-size:11px;color:#66666f;cursor:pointer">Dismiss</button>' +
          '</div>' +
        '</div>' +

        // Site card
        '<div class="uxr-site-card">' +
          '<div style="font-size:18px">🌐</div>' +
          '<div style="flex:1">' +
            '<div class="uxr-site-name">' + currentSiteName + '</div>' +
            '<div class="uxr-site-url">' + hostname + (pathname !== '/' ? pathname : '') + '</div>' +
          '</div>' +
        '</div>' +

        // What to analyze
        '<span class="uxr-label">What are you analyzing?</span>' +
        '<div class="uxr-mode-row">' +
          '<button type="button" class="uxr-mode-btn' + (defaultMode === 'page' ? ' active' : '') + '" id="uxr-mode-page">' +
            '<span class="uxr-mode-icon">📄</span>' +
            '<span class="uxr-mode-title">This page</span>' +
            '<span class="uxr-mode-desc">Analyze the current page only</span>' +
          '</button>' +
          '<button type="button" class="uxr-mode-btn' + (defaultMode === 'product' ? ' active' : '') + '" id="uxr-mode-product">' +
            '<span class="uxr-mode-icon">📱</span>' +
            '<span class="uxr-mode-title">This product</span>' +
            '<span class="uxr-mode-desc">Analyze the full product</span>' +
          '</button>' +
          '<button type="button" class="uxr-mode-btn" id="uxr-mode-other">' +
            '<span class="uxr-mode-icon">🔍</span>' +
            '<span class="uxr-mode-title">Another product</span>' +
            '<span class="uxr-mode-desc">Type any product name</span>' +
          '</button>' +
        '</div>' +

        // Other product name — only shows in "another product" mode
        '<div id="uxr-other-wrap" style="display:none!important">' +
          '<span class="uxr-label">Product name</span>' +
          '<input type="text" class="uxr-input" id="uxr-other-name" placeholder="e.g. Bolt, Notion, Kuda" />' +
        '</div>' +

        // Industry
        '<span class="uxr-label">Industry or Category</span>' +
        '<select class="uxr-select" id="uxr-industry">' +
          '<option value="">Select an industry...</option>' +
          '<option value="fintech payment platform">Fintech</option>' +
          '<option value="digital banking app">Digital Banking</option>' +
          '<option value="e-commerce marketplace">E-Commerce</option>' +
          '<option value="project management tool">Project Management</option>' +
          '<option value="design tool">Design Tools</option>' +
          '<option value="social media platform">Social Media</option>' +
          '<option value="video conferencing tool">Video Conferencing</option>' +
          '<option value="food delivery platform">Food Delivery</option>' +
          '<option value="ride-sharing app">Ride Sharing</option>' +
          '<option value="music streaming service">Music Streaming</option>' +
          '<option value="video streaming service">Video Streaming</option>' +
          '<option value="crypto exchange platform">Crypto Exchange</option>' +
          '<option value="learning management system">EdTech / LMS</option>' +
          '<option value="CRM software">CRM</option>' +
          '<option value="HR management platform">HR Platform</option>' +
          '<option value="developer tools">Developer Tools</option>' +
          '<option value="custom">Custom — type below</option>' +
        '</select>' +

        '<div id="uxr-custom-wrap" style="display:none">' +
          '<span class="uxr-label">Custom Category</span>' +
          '<input type="text" class="uxr-input" id="uxr-custom-cat" placeholder="e.g. AI writing tools" />' +
        '</div>' +

        // Focus areas
        '<span class="uxr-label">What specifically? <span style="color:#3a3a42;font-weight:400">(optional)</span></span>' +
        '<textarea class="uxr-textarea" id="uxr-focus" placeholder="e.g. onboarding, navigation, trust signals"></textarea>' +

        // Competitors
        '<span class="uxr-label">Compare with <span style="color:#3a3a42;font-weight:400">(optional, one per line)</span></span>' +
        '<textarea class="uxr-textarea" id="uxr-competitors" placeholder="Leave empty to analyze current product only"></textarea>' +

        // Depth
        '<span class="uxr-label">Depth</span>' +
        '<div class="uxr-depth-row">' +
          '<button type="button" class="uxr-depth-btn active" id="uxr-quick">Quick Scan<span class="uxr-depth-sub">~10s</span></button>' +
          '<button type="button" class="uxr-depth-btn" id="uxr-deep">Deep Teardown<span class="uxr-depth-sub">~25s</span></button>' +
        '</div>' +

        '<button type="button" class="uxr-btn" id="uxr-analyze">Analyze →</button>' +
        '<button type="button" class="uxr-btn-secondary" id="uxr-open-full">Open full tool →</button>' +
        '<div class="uxr-error" id="uxr-error"></div>' +
      '</div>' +

      '<div class="uxr-loading" id="uxr-loading">' +
        '<div class="uxr-spinner"></div>' +
        '<div class="uxr-loading-text" id="uxr-loading-text">Analyzing UX patterns...</div>' +
      '</div>' +
    '</div>' +

    '<div class="uxr-result" id="uxr-result">' +
      '<div class="uxr-result-header">' +
        '<div>' +
          '<div class="uxr-result-label">// analysis complete</div>' +
          '<div class="uxr-result-title" id="uxr-result-title"></div>' +
        '</div>' +
        '<button type="button" class="uxr-back-btn" id="uxr-back">← Back</button>' +
      '</div>' +
      '<div class="uxr-result-body" id="uxr-result-content"></div>' +
      '<div class="uxr-result-footer">' +
        '<button type="button" class="uxr-btn-sm" id="uxr-copy-summary">Copy Summary</button>' +
        '<button type="button" class="uxr-btn-sm" id="uxr-copy">Copy JSON</button>' +
        '<button type="button" class="uxr-btn-sm accent" id="uxr-view-full">View Full Report →</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(panel);

  // Set detected industry
  if (detectedIndustry) {
    document.getElementById('uxr-industry').value = detectedIndustry;
  }

  // Load last result from storage
  chrome.storage.local.get(['uxrivalLastResult', 'uxrivalLastCategory'], function(data) {
    if (data.uxrivalLastResult) {
      try {
        currentReportData = JSON.parse(data.uxrivalLastResult);
        currentCategory = data.uxrivalLastCategory || '';
        // Show restore banner
        var restoreBanner = document.getElementById('uxr-restore-banner');
        if (restoreBanner) restoreBanner.style.setProperty('display', 'flex', 'important');
      } catch(e) {}
    }
  });

  // Mode switching
  var modeBtns = ['uxr-mode-page', 'uxr-mode-product', 'uxr-mode-other'];
  modeBtns.forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      modeBtns.forEach(function(bid) {
        document.getElementById(bid).classList.remove('active');
      });
      this.classList.add('active');
      analysisMode = id.replace('uxr-mode-', '');

      var otherWrap = document.getElementById('uxr-other-wrap');
      var focusEl = document.getElementById('uxr-focus');
      var competitorsEl = document.getElementById('uxr-competitors');

      if (analysisMode === 'other') {
        otherWrap.style.setProperty('display', 'block', 'important');
        focusEl.placeholder = 'e.g. onboarding, checkout flow, trust signals';
        competitorsEl.placeholder = 'e.g. Bolt, Uber, InDrive';
      } else if (analysisMode === 'page') {
        otherWrap.style.setProperty('display', 'none', 'important');
        focusEl.placeholder = 'e.g. hero section, CTA clarity, trust signals on this page';
        competitorsEl.placeholder = 'Leave empty to analyze this page only';
      } else {
        otherWrap.style.setProperty('display', 'none', 'important');
        focusEl.placeholder = 'e.g. onboarding, navigation, core flows';
        competitorsEl.placeholder = 'Leave empty to analyze this product only';
      }
    });
  });

  // Depth buttons
  document.getElementById('uxr-quick').addEventListener('click', function() {
    currentDepth = 'quick';
    this.classList.add('active');
    document.getElementById('uxr-deep').classList.remove('active');
  });

  document.getElementById('uxr-deep').addEventListener('click', function() {
    currentDepth = 'deep';
    this.classList.add('active');
    document.getElementById('uxr-quick').classList.remove('active');
  });

  // Industry select
  document.getElementById('uxr-industry').addEventListener('change', function() {
    document.getElementById('uxr-custom-wrap').style.display = this.value === 'custom' ? 'block' : 'none';
  });

  // Buttons
  document.getElementById('uxr-analyze').addEventListener('click', analyze);
  document.getElementById('uxr-back').addEventListener('click', showForm);
  document.getElementById('uxr-copy').addEventListener('click', copyJSON);
  document.getElementById('uxr-copy-summary').addEventListener('click', copySummary);
  document.getElementById('uxr-restore-yes').addEventListener('click', function() {
    document.getElementById('uxr-restore-banner').style.setProperty('display', 'none', 'important');
    showResult(currentReportData);
  });
  document.getElementById('uxr-restore-no').addEventListener('click', function() {
    document.getElementById('uxr-restore-banner').style.setProperty('display', 'none', 'important');
    currentReportData = null;
    chrome.storage.local.remove(['uxrivalLastResult', 'uxrivalLastCategory']);
  });
  document.getElementById('uxr-open-full').addEventListener('click', function() {
    window.open('https://uxrival.xyz', '_blank');
  });
  document.getElementById('uxr-view-full').addEventListener('click', function() {
    if (currentReportData) {
      var encoded = btoa(JSON.stringify(currentReportData));
      window.open('https://uxrival.xyz/?report=' + encoded, '_blank');
    }
  });

  document.getElementById('uxr-close').addEventListener('click', function() {
    panel.style.setProperty('display', 'none', 'important');
    chrome.storage.local.set({ uxrivalOpen: false });
  });

  // Dragging
  var header = document.getElementById('uxrival-header');
  header.addEventListener('mousedown', function(e) {
    if (e.target.id === 'uxr-close') return;
    isDragging = true;
    dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
    dragOffsetY = e.clientY - panel.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var x = e.clientX - dragOffsetX;
    var y = e.clientY - dragOffsetY;
    x = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, y));
    panel.style.right = 'auto';
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function() { isDragging = false; });

  function buildCategory() {
    var industry = document.getElementById('uxr-industry').value;
    var customCat = document.getElementById('uxr-custom-cat').value.trim();
    return industry === 'custom' ? customCat : industry;
  }

  function buildSubject() {
    if (analysisMode === 'other') {
      return document.getElementById('uxr-other-name').value.trim() || currentSiteName;
    } else if (analysisMode === 'page') {
      return currentSiteName + ' (' + pathname + ' page)';
    } else {
      return currentSiteName;
    }
  }

  function analyze() {
    var category = buildCategory();
    var subject = buildSubject();
    var competitorsRaw = document.getElementById('uxr-competitors').value.trim();
    var focusAreas = document.getElementById('uxr-focus').value.trim();

    var competitors = competitorsRaw
      ? competitorsRaw.split('\n').map(function(s) { return s.trim(); }).filter(Boolean)
      : [subject];

    currentCategory = category || subject;
    document.getElementById('uxr-error').style.setProperty('display', 'none', 'important');
    showLoading();

    var scopeNote = analysisMode === 'page'
      ? 'Focus only on this specific page: ' + pathname + '. Not the whole product.'
      : analysisMode === 'other'
      ? 'Analyze ' + subject + ' as a product using your knowledge of it.'
      : 'Analyze the full ' + subject + ' product experience.';

    var finalFocus = focusAreas ? scopeNote + ' Specifically: ' + focusAreas : scopeNote;

    var dots = ['Analyzing UX patterns', 'Scoring competitors', 'Finding opportunities', 'Building your report'];
    var di = 0;
    var interval = setInterval(function() {
      di = (di + 1) % dots.length;
      var el = document.getElementById('uxr-loading-text');
      if (el) el.textContent = dots[di] + '...';
    }, 2000);

    // 30 second timeout
    var timeoutId = setTimeout(function() {
      clearInterval(interval);
      showForm();
      var errEl = document.getElementById('uxr-error');
      errEl.innerHTML = '⏱ Analysis is taking too long. Our AI may be under high demand. <strong>Try again in a moment.</strong>';
      errEl.style.setProperty('display', 'block', 'important');
    }, 30000);

    fetch('https://uxrival.xyz/api/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: currentCategory || subject,
        competitors: competitors,
        depth: currentDepth,
        focusAreas: finalFocus
      })
    })
    .then(function(res) {
      clearTimeout(timeoutId);
      clearInterval(interval);
      if (!res.ok) {
        if (res.status === 500) throw new Error('Our AI is under high demand right now. Try again in a moment.');
        if (res.status === 429) throw new Error('Too many requests. Wait a moment and try again.');
        throw new Error('Analysis failed — try again in a moment.');
      }
      return res.json();
    })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      currentReportData = data;
      // Save to storage for persistence
      chrome.storage.local.set({ uxrivalLastResult: JSON.stringify(data), uxrivalLastCategory: currentCategory });
      showResult(data);
    })
    .catch(function(err) {
      clearTimeout(timeoutId);
      clearInterval(interval);
      showForm();
      var errEl = document.getElementById('uxr-error');
      errEl.innerHTML = '⚠ ' + (err.message || 'Analysis failed. Check your connection and try again.');
      errEl.style.setProperty('display', 'block', 'important');
    });
  }

  function showResult(data) {
    document.getElementById('uxrival-body').style.setProperty('display', 'none', 'important');
    document.getElementById('uxr-result').style.setProperty('display', 'flex', 'important');
    document.getElementById('uxr-result-title').textContent = currentCategory;

    var html = '';
    if (data.headline) html += '<div class="uxr-headline">' + data.headline + '</div>';

    if (data.scores) {
      html += '<div class="uxr-score-row">';
      for (var name in data.scores) {
        var score = data.scores[name];
        var color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
        html += '<div class="uxr-score-card">' +
          '<div class="uxr-score-name">' + name + '</div>' +
          '<div class="uxr-score-val" style="color:' + color + '">' + score + '</div>' +
          '</div>';
      }
      html += '</div>';
    }

    if (data.secs && data.secs.length > 0) {
      html += '<div style="margin-top:4px">';
      data.secs.forEach(function(sec) {
        html += '<div style="font-family:monospace;font-size:9px;color:#66666f;text-transform:uppercase;' +
          'letter-spacing:0.1em;margin:10px 0 6px;padding:5px 8px;background:#0f0f12;border-radius:4px">' +
          sec.cat + '</div>';
        if (sec.rows) {
          sec.rows.forEach(function(row) {
            html += '<div style="background:#17171a;border:1px solid #212126;border-radius:8px;' +
              'padding:10px 12px;margin-bottom:8px">';
            html += '<div style="font-size:12px;color:#a0a0b0;margin-bottom:6px;font-weight:600">' + row.dim + '</div>';
            if (row.sc) {
              for (var comp in row.sc) {
                var rating = row.sc[comp];
                var rColor = rating.r === 'Excellent' ? '#4ade80' :
                  rating.r === 'Good' ? '#a3e635' :
                  rating.r === 'Average' ? '#facc15' : '#f87171';
                html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
                  '<span style="font-size:10px;color:#66666f;min-width:70px">' + comp + '</span>' +
                  '<span style="font-size:10px;color:' + rColor + ';font-weight:600">' + rating.r + '</span>' +
                  '</div>';
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
      html += '<div class="uxr-opp">' +
        '<div class="uxr-opp-label">Market Gap</div>' +
        '<div class="uxr-opp-text">' + data.opp + '</div>' +
        '</div>';
    }

    document.getElementById('uxr-result-content').innerHTML = html;
  }

  function showForm() {
    document.getElementById('uxrival-body').style.setProperty('display', 'block', 'important');
    document.getElementById('uxr-result').style.setProperty('display', 'none', 'important');
    document.getElementById('uxr-form').style.setProperty('display', 'block', 'important');
    document.getElementById('uxr-loading').style.setProperty('display', 'none', 'important');
  }

  function showLoading() {
    document.getElementById('uxr-form').style.setProperty('display', 'none', 'important');
    document.getElementById('uxr-loading').style.setProperty('display', 'block', 'important');
  }

  function copyJSON() {
    if (currentReportData) {
      navigator.clipboard.writeText(JSON.stringify(currentReportData, null, 2));
    }
  }

  function copySummary() {
    if (!currentReportData) return;
    var d = currentReportData;
    var lines = [];
    lines.push('UX Rival Analysis — ' + currentCategory);
    lines.push('');
    if (d.headline) lines.push(d.headline);
    lines.push('');
    if (d.scores) {
      lines.push('UX SCORES');
      for (var name in d.scores) {
        lines.push(name + ': ' + d.scores[name] + '/100');
      }
      lines.push('');
    }
    if (d.secs) {
      d.secs.forEach(function(sec) {
        lines.push(sec.cat.toUpperCase());
        if (sec.rows) {
          sec.rows.forEach(function(row) {
            var ratings = [];
            if (row.sc) {
              for (var comp in row.sc) {
                ratings.push(comp + ': ' + row.sc[comp].r);
              }
            }
            lines.push('  ' + row.dim + ' — ' + ratings.join(', '));
            if (row.rec) lines.push('  → ' + row.rec);
          });
        }
        lines.push('');
      });
    }
    if (d.opp) {
      lines.push('MARKET GAP');
      lines.push(d.opp);
      lines.push('');
    }
    lines.push('Generated by UX Rival — uxrival.xyz');
    lines.push('⚠ AI-generated. Verify findings with direct product research.');
    navigator.clipboard.writeText(lines.join('\n'));

    // Show feedback
    var copyBtn = document.getElementById('uxr-copy-summary');
    if (copyBtn) {
      copyBtn.textContent = 'Copied ✓';
      setTimeout(function() { copyBtn.textContent = 'Copy Summary'; }, 2000);
    }
  }

  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.action === 'toggle') {
      var isHidden = panel.style.getPropertyValue('display') === 'none';
      if (isHidden) {
        panel.style.setProperty('display', 'flex', 'important');
        chrome.storage.local.set({ uxrivalOpen: true });
      } else {
        panel.style.setProperty('display', 'none', 'important');
        chrome.storage.local.set({ uxrivalOpen: false });
      }
    }
  });

})();
