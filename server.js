const webpush = require('web-push');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// === Połączenie z MongoDB ===
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/pwa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => console.error('❌ Błąd połączenia z MongoDB:', err));

// === Schemat subskrypcji ===
const subscriptionSchema = new mongoose.Schema({}, { strict: false });
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// === VAPID keys z ENV ===
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:kontakt@example.com',
  publicKey,
  privateKey
);

// === 🔥 [NOWE] Endpoint do zapisu subskrypcji ===
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

// === [Opcjonalnie] Testowy endpoint do wysyłki powiadomień ===
app.post('/send', async (req, res) => {
  const subs = await Subscription.find({});
  const payload = JSON.stringify({
    title: '💸 Uwaga!',
    body: 'Nowa transakcja została zaksięgowana.',
  });

  for (let sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error('❌ Błąd wysyłania push:', err);
    }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🚀 Serwer działa na porcie ${port}`);
});
