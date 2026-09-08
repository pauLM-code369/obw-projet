const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Le serveur OBW fonctionne !');
});

module.exports = app;