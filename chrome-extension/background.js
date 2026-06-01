chrome.action.onClicked.addListener(function(tab) {
  if (!tab || !tab.url) return;
  if (tab.url.indexOf('chrome://') === 0) return;
  if (tab.url.indexOf('chrome-extension://') === 0) return;
  if (tab.url.indexOf('about:') === 0) return;

  chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, function() {
    if (chrome.runtime.lastError) {
      console.log('Content script not ready:', chrome.runtime.lastError.message);
    }
  });
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle-panel') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, function() {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready');
        }
      });
    });
  }
});
