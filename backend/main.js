require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
