// app.js sets up and configures the Express application, server.js

const express = require('express');
const cors = require('cors');

const app = express();

// Use middleware here
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// List all routes here

module.exports = app;