const vision = require('@google-cloud/vision');

// Insert Vision API client
const client = new vision.ImageAnnotatorClient({
    keyFilename: '/Users/admin/Downloads/elite-epoch-442605-a3-022477821b6b.json' // Path to your key file
});

async function testVisionAPI() {
    try {
        // Replace 'path-to-your-image.jpg' with an actual image path
        const [result] = await client.textDetection('/Users/admin/Downloads/image4.jpg');
        const text = result.fullTextAnnotation ? result.fullTextAnnotation.text : 'No text detected';
        console.log('OCR Output:');
        console.log(text);
    } catch (error) {
        console.error('Error during Vision API request:', error);
    }
}

testVisionAPI();
