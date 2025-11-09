// app.js will setup Express app aka server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import db from './db/db.js';

// Import all routes here later.


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define and list routes here from imported route files later.

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;