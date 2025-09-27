require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const vehiclesRoutes = require('./routes/vehicles.routes');
const usersRoutes = require('./routes/users.routes');
const requestLoggerMiddleware = require('./middleware/requestLogger');

const app = express();

// Configurar trust proxy para obtener IP real
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware para logging de requests (debe ir antes de las rutas)
app.use(requestLoggerMiddleware);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/users', usersRoutes);


const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
