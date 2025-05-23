const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Połączenie z Mongo
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(' Połączono z MongoDB'))
  .catch(err => console.error(' Błąd Mongo:', err));

// Model użytkownika
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

// Rejestracja
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(409).json({ message: "Użytkownik już istnieje" });

  await new User({ username, password }).save();
  res.status(200).json({ message: "Zarejestrowano" });
});

// Logowanie
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ message: "Błędny login lub hasło" });

  res.status(200).json({ message: "Zalogowano poprawnie" });
});

app.listen(port, () => {
  console.log(` Server działa na porcie ${port}`);
});
