# CURIA Case Extractor

CURIA Case Extractor is a Chrome extension that extracts case information from the CURIA website and saves it as a CSV file. This extension can extract data for a single case or multiple cases from a search query page.

## Features

- Extract single case information
- Extract all cases information from the search query page
- Save extracted information as a CSV file

## Installation

1. [Download the ZIP file](https://github.com/OTFlorian/curia-extractor/archive/refs/heads/main.zip) of this repository.
2. Extract the ZIP file to a folder on your computer.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer mode" in the top right corner.
5. Click on "Load unpacked" and select the directory where you extracted the ZIP file.

## Usage

1. Navigate to a case page or a search query page on CURIA.
2. Click on the extension icon.
3. Click "Extract Single Case" to extract data for the current case.
4. Click "Extract All Cases" to extract data for all cases listed on the current search query page.

## Extracted Data Fields

The extension extracts the following data fields for each case:

- **Case Number**: The unique identifier of the case.
- **Case Name**: The name of the case.
- **Origin of the Question**: The source of the question referred for a preliminary ruling.
- **Year Delivered**: The year the judgment was delivered.
- **Type of Proceedings**: Currently set to '1' by default.
- **Field of Law**: The legal field related to the case.
- **Reporting Judge Name**: The name of the reporting judge.
- **Composition**: The composition of the court.
- **Order/Judgement**: Indicates the type of judgement.
- **AG (Advocate General)**: The name of the Advocate General.
- **Opinion**: Indicates whether an opinion is present.
- **Link to the Case Information**: The URL of the case.

## How Values Are Determined

### Case Number

- **Case Number**: Extracted from bold titles on the case detail page. The case number is identified using a regular expression pattern `C-<numbers>/<numbers>`.

### Case Name

- **Case Name**: Extracted from the bold titles, adjusting for specific formats.

### Origin of the Question

- **Origin of the Question**: Extracted from the section titled "Source of the question referred for a preliminary ruling".

### Year Delivered

- **Year Delivered**: Extracted from the "Date of delivery" section, specifically the year portion.

### Field of Law

- **Field of Law**: Extracted from the "Procedural Analysis Information" section, specifically from the list items under the "Subject-matter" heading.

### Reporting Judge Name

- **Reporting Judge Name**: Extracted from the section titled "Judge-Rapporteur".

### Advocate General

- **Advocate General**: Extracted from the section titled "Advocate General".

### Opinion

- **Opinion**: Extracted from the section titled "Language(s) of the Opinion". The value is further determined based on the presence of opinions in the document.
  - `'*'`: Default value indicating no specific opinion determination.
  - `'1'`: Opinion is present.
  - `'0'`: Opinion is not present.
  - `'-'`: Opinion determination is not applicable.

### Composition

- **Composition**: Extracted based on the presence of specific text patterns and the number of judges mentioned.
  - `'3'`: Three judges.
  - `'5'`: Five judges.
  - `'GC'`: Grande Chambre (if mentioned).
  - `'-'`: Decided by the President.
  - `'*'`: Default value indicating no specific composition determination.

### Order/Judgement

- **Order/Judgement**: Extracted based on specific text patterns and references to articles in the judgement.
  - `'1'`: Standard judgment.
  - `'2'`: Includes Article 99.
  - `'3'`: Includes Article 53.
  - `'2; 3'`: Includes both Article 99 and Article 53.
  - `'4'`: Decided by the President.
  - `'-'`: Default value if no specific order/judgement is determined.

### Type of Proceedings

- **Type of Proceedings**: Currently set to `'1'` by default.

## Files

- `manifest.json`: Configuration file for the Chrome extension.
- `background.js`: Handles background tasks and listens for extension installation.
- `content.js`: Contains the script to extract data from the CURIA website.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file to handle user interactions in the popup.

## License

This project is licensed under a custom license.
