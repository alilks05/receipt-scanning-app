require('dotenv').config();

const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = 3000;

// Set up Google Cloud Vision API
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Use env variable
});


// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Parse receipt function
async function parseReceipt(text) {
    const lines = text.split('\n').map(line => line.trim());
    let vendorName = '';
    let lineItems = [];
    let totalAmount = 0;

    // Regex patterns
    const vendorRegex = /^[A-Za-z\s]+$/; // Matches vendor names
    const totalRegex = /(bal|total)\s+[-(]?([\d.]+)[-)]?/i; // Matches "BAL 45.44" or "TOTAL 45.44"
    const priceLineRegex = /^([\d.]+)\s*B$/; // Matches "6.99 B"
    const combinedLineRegex = /^(.+?)\s+([\d.]+)\s*B$/; // Matches "PL TORTILLA S 6.99 B"
    const standaloneNumericRegex = /^\(?[\d.]+\)?$/; // Matches standalone numbers like "45.44"

    console.log('OCR Lines:', lines);

    // Extract vendor name (combine consecutive uppercase lines)
    for (let i = 0; i < lines.length; i++) {
        if (vendorRegex.test(lines[i])) {
            vendorName += (vendorName ? ' ' : '') + lines[i];
        } else {
            break;
        }
    }

    console.log('Vendor Name:', vendorName);

    // Process each line for items and totals
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match combined item and price line
        const combinedMatch = line.match(combinedLineRegex);
        if (combinedMatch) {
            const [_, name, price] = combinedMatch;
            lineItems.push({ name, price: parseFloat(price), amount: parseFloat(price) });
            continue;
        }

        // Match split item line with price on the next line
        if (i + 1 < lines.length && priceLineRegex.test(lines[i + 1])) {
            const name = line;
            const priceMatch = lines[i + 1].match(priceLineRegex);
            const price = parseFloat(priceMatch[1]);
            lineItems.push({ name, price, amount: price });
            i++; // Skip the next line
            continue;
        }

        // Match total amount
        const totalMatch = line.match(totalRegex);
        if (totalMatch) {
            totalAmount = parseFloat(totalMatch[2]);
            continue;
        }

        // Handle standalone numeric line as potential total
        if (standaloneNumericRegex.test(line) && i > 0 && lines[i - 1].toLowerCase().includes('bal')) {
            totalAmount = parseFloat(line.replace(/[()]/g, ''));
        }
    }

    // Return parsed details
    return {
        vendorName: vendorName.trim() || 'Unknown Vendor',
        lineItems,
        totalAmount: totalAmount || 0,
    };
}

// POST route to upload receipt image
app.post('/upload', upload.single('receipt'), async (req, res) => {
    try {
        const filePath = path.join(__dirname, req.file.path);
        const [result] = await client.textDetection(filePath);
        const text = result.fullTextAnnotation ? result.fullTextAnnotation.text : '';

        console.log('OCR Raw Output:', text);

        const parsedDetails = await parseReceipt(text);
        console.log('Parsed Details:', parsedDetails);

        // Save parsed details to a JSON file
        const jsonPath = path.join(__dirname, 'parsed_receipt.json');
        fs.writeFileSync(jsonPath, JSON.stringify(parsedDetails, null, 2), 'utf-8');
        console.log(`Parsed details saved to ${jsonPath}`);

        res.send(`
            <h1>Extracted Receipt Details</h1>
            <h2>Vendor: ${parsedDetails.vendorName}</h2>
            <h3>Line Items:</h3>
            <ul>
                ${parsedDetails.lineItems
                    .map(
                        item => `
                        <li>${item.name}: $${item.amount.toFixed(2)}</li>
                    `
                    )
                    .join('')}
            </ul>
            <h3>Total Amount: $${parsedDetails.totalAmount.toFixed(2)}</h3>
            <a href="/">Upload another receipt</a>
        `);
    } catch (error) {
        console.error('Error during OCR processing:', error);
        res.status(500).send('Error processing the receipt.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
