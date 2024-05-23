const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
    .then(() => {
        console.log("Database Connected");
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.listen(PORT, () => {
    console.log(`serve at http://localhost:${PORT}`);
  });