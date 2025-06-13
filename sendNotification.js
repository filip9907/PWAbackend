const webpush = require('web-push');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/pwa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => console.error('❌ Błąd połączenia z MongoDB:', err));

const subscriptionSchema = new mongoose.Schema({}, { strict: false });
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// === VAPID KEYS (podmień na swoje) ===
//const publicKey = 'BN1Th8pknPloKF_UsPvMnl1Cu3EdpupaTw2W-uZQqTPSmGdR8aEcjsnpZssuHLa-QAZiR-qSM7lh8bgLjiJg-fQ';
//const privateKey = 'hmmSroO-AJi3OQv-IriAc0sKMobTwBuXoA65zrSnUdg';
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;



webpush.setVapidDetails(
  'mailto:kontakt@example.com',
  publicKey,
  privateKey
);

// Endpoint testowy do ręcznego wywołania
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
  console.log(`🚀 Serwer powiadomień działa na http://localhost:${port}`);
});
