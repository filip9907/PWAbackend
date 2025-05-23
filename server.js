const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS — jeśli frontend działa na innym hoście, np. GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Możesz tu wpisać konkretną domenę
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Przykładowa trasa rejestracji
app.post('/register', (req, res) => {
  console.log('Received registration:', req.body);
  res.status(200).json({ message: 'Zarejestrowano' });
});

// Start serwera HTTP
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
