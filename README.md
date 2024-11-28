
## Receipt Scanning App

A web application that extracts and displays details from uploaded receipt images using OCR (Optical Character Recognition) technology.

Features
Upload a receipt image in JPG or PNG format.
Automatically parse the receipt for:
Vendor name.
Line items (name, price, and amount).
Total amount.
JSON output of the parsed receipt details.
Deployed on Vercel for easy access and scalability.
Setup Instructions
1. Prerequisites
Node.js installed on your system (version 14+).
A Google Cloud account with access to the Vision API.
Vercel CLI installed globally on your system.
2. Clone the Repository

3. Install Dependencies
npm install

4. Configure Google Cloud Vision API
Enable the Vision API in your Google Cloud project.
Create a service account with access to the Vision API.
Download the JSON key file for the service account.
Save the JSON file to a secure location (e.g., /Users/admin/Downloads/your-key.json).
Add the environment variable for the API key:

5. Start the Server
node server.js
The app will be available at: http://localhost:3000.


## API Choice and Rationale
Google Vision API
## Why Google Vision API?
Accurate OCR capabilities for extracting text from images.
Easy integration with Node.js through the @google-cloud/vision library.
High reliability and performance for parsing various receipt formats.
Limitations:
Requires a Google Cloud account and billing setup.
Sensitive to image quality—blurry or low-resolution images may yield inaccurate results.

## Limitations and Assumptions
Image Quality: Parsing accuracy depends on the clarity of the receipt image.
Format Dependence: The app is optimized for standard receipt layouts. Non-standard layouts may not be processed accurately.
Vendor Name Extraction: Assumes vendor names are at the top of the receipt in uppercase.
Manual API Key Input: In production, users must input their API key for secure and personalized usage.

## Notable Features
JSON Output:
Parsed receipt details are saved as a JSON file (parsed_receipt.json) for external usage.
Server-Side OCR Parsing:
Offloads processing to a server for efficient handling of large image files.
Frontend Integration:
Includes a simple UI for users to upload receipt images and view extracted details.
