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

// Model transakcji
const Transaction = mongoose.model('Transaction', new mongoose.Schema({
  userId: String,
  type: String,           // 'income' / 'expense'
  category: String,
  amount: Number,
  date: String
}));

// Dodawanie transakcji
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

// Pobieranie transakcji użytkownika
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId });
    res.json(transactions);
  } catch (err) {
    console.error('Błąd odczytu transakcji:', err);
    res.status(500).json([]);
  }
});

const webpush = require('web-push');

// VAPID konfig
webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Model subskrypcji
const subscriptionSchema = new mongoose.Schema({}, { strict: false });
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Endpoint do wysyłania powiadomień
app.post('/notify', async (req, res) => {
  try {
    const subs = await Subscription.find();

    const payload = JSON.stringify({
      title: '🔔 Nowe powiadomienie!',
      body: 'Testowe PUSH z backendu Railway!',
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

