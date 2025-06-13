// === server.js ===
const express = require('express');
const mongoose = require('mongoose');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://filip9907.github.io',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => console.error('❌ Błąd MongoDB:', err));

// MODELE
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
  userId: String,
  type: String,
  category: String,
  amount: Number,
  date: String
}));

const Subscription = mongoose.model('Subscription', new mongoose.Schema({}, { strict: false }));

// VAPID
webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ROUTY

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

// Dodaj transakcję
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Błąd zapisu transakcji:', err);
    res.status(500).json({ success: false });
  }
});

// Pobierz transakcje
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId });
    res.json(transactions);
  } catch (err) {
    console.error('Błąd odczytu transakcji:', err);
    res.status(500).json([]);
  }
});

// Zapisz subskrypcję PUSH
app.post('/subscribe', async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    console.log('✅ Subskrypcja zapisana:', req.body);
    res.status(201).json({ message: 'Subskrypcja zapisana' });
  } catch (error) {
    console.error('❌ Błąd zapisu subskrypcji:', error);
    res.status(500).json({ message: 'Błąd zapisu subskrypcji' });
  }
});

// Wyślij powiadomienia
app.post('/notify', async (req, res) => {
  try {
    const subs = await Subscription.find();
    const payload = JSON.stringify({
      title: '🔔 Nowa transakcja!',
      body: 'Dodano nową transakcję do systemu'
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        console.log("✔️ Wysłano");
      } catch (err) {
        console.error("❌ Błąd wysyłania:", err);
      }
    }

    res.status(200).json({ message: 'Powiadomienia wysłane' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start serwera
app.listen(port, () => {
  console.log(`🚀 Server działa na porcie ${port}`);
});
