const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();

app.listen(PORT, () => {
  console.log(`Listening at ${PORT}`);
});
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello Node!');
});

app.get('/api', (req, res) => {
  database.find({}, (err, data) => {
    res.json(data);
  });
});

app.post('/api', (req, res) => {
  const location = req.body;
  database.insert(location);
  res.json(location);
});
