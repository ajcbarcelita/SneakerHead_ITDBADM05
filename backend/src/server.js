require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});