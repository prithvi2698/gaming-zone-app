/* global require, __dirname, process */
const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\Prithvi\\Downloads\\gaming-zone-app.html', 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/i);
if (match) {
    fs.writeFileSync('C:\\Users\\Prithvi\\.gemini\\antigravity\\scratch\\gaming-zone-app\\src\\index.css', match[1].trim());
    console.log('CSS extracted successfully');
} else {
    console.log('No style tag found');
}
