import app from './app.js';
import dotenv from 'dotenv/config';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Failed to start Express server:', err);
  process.exit(1);
});