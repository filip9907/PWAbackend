const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.post('/register', (req, res) => {
  console.log('Received registration:', req.body);
  res.status(200).json({ message: 'Zarejestrowano' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
