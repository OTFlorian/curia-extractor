chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

// Handle navigation requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'navigateToCase') {
    chrome.tabs.update(sender.tab.id, { url: request.link }, sendResponse);
    return true; // Indicates that the response is sent asynchronously
  }
});
