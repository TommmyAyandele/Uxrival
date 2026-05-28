chrome.action.onClicked.addListener(function(tab) {
  if (!tab || !tab.url) return;
  if (tab.url.indexOf('chrome://') === 0) return;
  if (tab.url.indexOf('chrome-extension://') === 0) return;
  if (tab.url.indexOf('about:') === 0) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: function() {
      var panel = document.getElementById('uxrival-panel');
      if (panel) {
        var isHidden = panel.style.getPropertyValue('display') === 'none';
        if (isHidden) {
          panel.style.setProperty('display', 'flex', 'important');
        } else {
          panel.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }).catch(function() {});
});
