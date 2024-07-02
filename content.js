// Helper function to trim empty <p> elements and get the value after a heading
function getValueAfterHeading(headingText) {
  const headingElement = document.evaluate(`//h3[contains(text(), "${headingText}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (headingElement) {
    let valueElement = headingElement.nextElementSibling;
    while (valueElement && valueElement.tagName === 'P' && valueElement.innerText.trim() === '') {
      valueElement = valueElement.nextElementSibling;
    }
    if (valueElement && valueElement.tagName === 'P') {
      if ( valueElement.innerText.trim() === 'Information not available') { 
        return '-';
      }
      return valueElement.innerText.trim();
    }
  }
  return '-';
}

// Function to extract data from the HTML
function extractData() {
  const data = {};

  // Extract case number and name from bold titles
  const detailsTitle = document.querySelector('.details_decision_title');
  if (detailsTitle) {
    const titleText = detailsTitle.innerText.split('\n').map(t => t.trim());
    data.caseName = titleText[0];
    data.caseNumber = titleText[1].replace('Case ', '');
  }

  // Extract origin of the question
  data.origin = getValueAfterHeading('Source of the question referred for a preliminary ruling');
  if (data.origin !== '-') {
    data.origin = data.origin.split(' - ')[1].trim();
  }

  // Extract year delivered
  const dateDelivered = getValueAfterHeading('Date of delivery');
  if (dateDelivered !== '-') {
    const dateParts = dateDelivered.split('/');
    data.yearDelivered = dateParts[dateParts.length - 1].trim();
  } else {
    data.yearDelivered = '-';
  }

  // Set Type of Proceedings to 1
  data.typeOfProceedings = '1';

  // Set default orderJudgement
  data.orderJudgement = '-';

  // Extract field of law from the "Procedural Analysis Information" section
  const subjectMatterElements = document.evaluate("//h2[contains(text(), 'Procedural Analysis Information')]/following-sibling::h3[contains(text(), 'Subject-matter')]/following-sibling::ul[1]/li/span", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  if (subjectMatterElements.snapshotLength > 0) {
    data.fieldOfLaw = Array.from({ length: subjectMatterElements.snapshotLength }, (v, i) => subjectMatterElements.snapshotItem(i).innerText.trim()).join('; ');
  } else {
    data.fieldOfLaw = '-';
  }

  // Extract reporting judge
  data.reportingJudge = getValueAfterHeading('Judge-Rapporteur');

  // Extract advocate general
  data.ag = getValueAfterHeading('Advocate General');

  // Extract opinion
  data.opinionRaw = getValueAfterHeading('Language(s) of the Opinion');
  data.opinion = '*';

  // Extract opinion
  data.formationRaw = getValueAfterHeading('Formation of the Court');

  // Extract link to the case information
  data.link = window.location.href;

  // Extract composition and order/judgement asynchronously
  return extractCompositionAndOrder(data);
}

function extractCompositionAndOrder(data) {
  return new Promise((resolve) => {
    data.composition = '*';
    const orderRows = document.querySelectorAll('.table_document_ligne');
    let correctOrderLinkElement = null;
    let orderCellText = '';

    orderRows.forEach(row => {
      const orderCell = row.querySelector('.table_cell_doc');
      if (orderCell.innerText.trim().includes('Judgment') || orderCell.innerText.trim().includes('Judgement')) {
        data.orderJudgement = '1';
      }
      if (orderCell.innerText.trim().includes('Opinion')) {
        data.opinionPresent = '1';
      }
      if (orderCell && (orderCell.innerText.trim().startsWith('Order') || orderCell.innerText.trim().startsWith('Judgment') || orderCell.innerText.trim().startsWith('Judgement')) && orderCell.querySelector('.outputEcli') && orderCell.querySelector('.outputEcli').innerText.trim() !== '') {
        let cell = row.querySelector('.table_cell_links_curia');
        let links = cell.querySelectorAll('a');
        links.forEach(link => {
          if (link.textContent.trim().includes('French')) {
            correctOrderLinkElement = link;
          }
        });
        if (!correctOrderLinkElement) {
          cell = row.querySelector('.table_cell_links_eurlex');
          links = cell.querySelectorAll('a');
          links.forEach(link => {
            if (link.textContent.trim().includes('French')) {
              correctOrderLinkElement = link;
            }
          });
        }
        if (correctOrderLinkElement) {
          orderCellText = orderCell.innerText;
        }
      }
    });

    if (correctOrderLinkElement) {
      fetch(correctOrderLinkElement.href)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.text();
        })
        .then(text => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const compositionElement = doc.evaluate("//p[contains(text(), 'composée de')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (compositionElement) {
            let compositionText = compositionElement.innerText;

            // Remove trailing commas
            compositionText = compositionText.replace(/,\s*$/, '');
            compositionText = compositionText.replace(', et', ' et');

            // Split the composition text
            const substrings = compositionText.split(/,\s*|\set\s*/).filter(Boolean); // Filter out empty strings
            console.log(substrings);

            // Filter out substrings containing "juge" or "président"
            const filteredSubstrings = substrings.filter(substring => 
              !substring.includes("juge") && !substring.includes("président")
            );

            console.log(filteredSubstrings);

            // Count the remaining substrings
            const judges = filteredSubstrings.length;

            console.log('Judges: ', judges);
            if (judges === 3) data.composition = '3'; // Handle "juges" and the president role
            if (judges === 5) data.composition = '5';
            if (compositionText.includes('grande chambre') || data.formationRaw.includes('grande')) data.composition = 'GC';
          } else {
            console.log('Composition element not found');
          }
          console.log('Order Text: ', doc.body.innerText.toLowerCase());
          // Extract order/judgement
          if (orderCellText.includes('Order') && data.orderJudgement != '1') {
            console.log('Checking order text');
            const orderText = doc.body.innerText.toLowerCase();
            const hasArticle99 = /article[\u00A0\s]99/.test(orderText);
            const hasArticle53 = /article[\u00A0\s]53/.test(orderText);
            if (data.composition === '1') {
              data.orderJudgement = '4';
            } else if (hasArticle99 && hasArticle53) {
              data.orderJudgement = '2; 3';
            } else if (hasArticle99) {
              data.orderJudgement = '2';
            } else if (hasArticle53) {
              data.orderJudgement = '3';
            }
            let normalizedOrderText = doc.body.innerText.replace(/\s+/g, ' ').trim();
            console.log('Data composition: ', data.composition);
            console.log(normalizedOrderText);
            console.log('Includes ordonnance du president? ', normalizedOrderText.includes('ORDONNANCE DU PRÉSIDENT DE LA COUR'));
            if (normalizedOrderText.includes('ORDONNANCE DU PRÉSIDENT DE LA COUR') && data.composition === '*') {
              console.log('It is the decision by the president (according to the text).');
              data.presidentInText = '1';
              data.composition = '-';
            }
          }

          // Resolve the promise with the updated data
          resolve(data);
        })
        .catch(error => {
          console.error('Error fetching document:', error);
          // Resolve the promise even if fetching fails
          resolve(data);
        });
    } else {
      console.log('No French document link found');
      // Resolve the promise if no composition link is found
      resolve(data);
    }
  });
}

// Function to download the CSV
function downloadCSV(data) {
  const csvData = [
    ['Case Number', 'Case Name', 'Origin of the Q', 'Year Delivered', 'Type of Proceedings', 'Field of Law', 'Reporting Judge Name', 'Composition', 'Order/Judgement', 'AG', 'Opinion', 'Comments', 'Link to the Case Information'],
    [
      data.caseNumber, data.caseName, data.origin, data.yearDelivered,
      data.typeOfProceedings, data.fieldOfLaw, data.reportingJudge,
      data.composition, data.orderJudgement, data.ag, data.opinion,
      '', data.link
    ]
  ];

  // Function to escape values
  const escapeValue = (value) => {
    if (typeof value === 'string') {
      // Escape double quotes by doubling them
      value = value.replace(/"/g, '""');
      // Wrap the value in double quotes
      return `"${value}"`;
    }
    return `"${value}"`;
  };

  // Create CSV content
  const csvContent = "data:text/csv;charset=utf-8," 
      + csvData.map(row => row.map(escapeValue).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const filename = `curia_case_info_${data.caseNumber}.csv`;
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
}

// Event listener for the Extract button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    console.log('Received extractData message');
    extractData().then(data => {
      console.log('Extracted data:', data);
      if (data.formationRaw.includes('président') || data.formationRaw.includes('president') || data.presidentInText === '1') {
        data.composition = '-';
        data.orderJudgement = '4';
        console.log('Decided by President, setting composition to 1 and orderJudgement to removal');
      }
      if (data.opinionPresent) {
        data.opinion = '1';
        console.log('Opinion is present in the table, setting it to 1');
      }
      if (data.opinionRaw !== '-' && data.opinion !== '1' && data.orderJudgement === '1') {
        data.opinion = '1';
      } else if (data.opinionRaw === '-' && data.opinion !== '1' && data.orderJudgement === '1') {
        data.opinion = '0';
      } else if (data.orderJudgement === '2; 3' || data.orderJudgement === '4' || data.orderJudgement === '2' || data.orderJudgement === '3') {
        data.opinion = '-';
        console.log('OrderJudgement is 2, 3, 4 or combination, so setting Opinion to -.');
      }
      console.log('Extracted data:', data);
      downloadCSV(data);
      sendResponse({status: 'Extraction complete'});
    }).catch(error => {
      console.error('Error extracting data:', error);
      sendResponse({status: 'Extraction failed', error: error.message});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

// Expose functions to the popup script
window.extractData = extractData;
window.downloadCSV = downloadCSV;
