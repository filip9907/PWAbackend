const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS – dodaj to przed wszystkimi endpointami
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // lub domenę frontendu
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // <–– to naprawia preflight!
  }
  next();
});

app.post('/register', (req, res) => {
  console.log("register:", req.body);
  res.status(200).json({ message: "Zarejestrowano" });
});

app.post('/login', (req, res) => {
  console.log("login:", req.body);
  res.status(200).json({ message: "Zalogowano" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
