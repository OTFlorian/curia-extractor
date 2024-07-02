# CURIA Case Extractor

CURIA Case Extractor is a Chrome extension designed to extract case information from the CURIA website and save it as a CSV file.

## Features

- Extract case number and name
- Extract origin of the question
- Extract year delivered
- Extract field of law
- Extract reporting judge
- Extract advocate general
- Extract opinion and formation of the court
- Download the extracted data as a CSV file

## Installation

To install the CURIA Case Extractor extension in Google Chrome, follow these steps:

1. **Download the repository**

   Download the zipped repository from [this link](https://github.com/OTFlorian/curia-extractor/archive/refs/heads/main.zip).

2. **Extract the files**

   Unzip the downloaded file to a directory of your choice.

3. **Load the extension in Chrome**

   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" by clicking the toggle switch in the top right corner.
   - Click the "Load unpacked" button and select the directory where you unzipped the files.

4. **Confirm the installation**

   The CURIA Case Extractor extension should now appear in your list of extensions.

## Usage

1. **Navigate to the CURIA website**

   Go to the CURIA website and open the case you want to extract information from.

2. **Open the extension**

   Click on the CURIA Case Extractor extension icon in the Chrome toolbar.

3. **Extract data**

   Click the "Extract Data" button in the popup. The extension will process the page and download a CSV file with the extracted case information.

## Files

- `manifest.json`: Configuration file for the Chrome extension.
- `background.js`: Handles background tasks and listens for extension installation.
- `content.js`: Contains the script to extract data from the CURIA website.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file to handle user interactions in the popup.

## License

This project is licensed under a custom license.
