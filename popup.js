document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('extract').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Sending extractData message to content script');
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          return;
        }
        if (response && response.status === 'Extraction complete') {
          console.log('Data extraction completed successfully.');
        } else {
          console.error('Data extraction failed or response was undefined.');
        }
      });
    });
  });
});
