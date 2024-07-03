document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('extract').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' });
    });
  });

  // New button event listener for extracting all cases
  document.getElementById('extractAll').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractAllData' });
    });
  });
});
