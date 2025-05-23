const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 443;

const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

app.use(express.static(__dirname));

https.createServer(options, app).listen(PORT, () => {
    console.log(`✅ Serwer HTTPS działa na https://localhost:${PORT}`);
});
