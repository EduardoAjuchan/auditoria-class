const RequestLogModel = require('../models/requestLog.model');

/**
 * Middleware para logging de todos los requests
 */
const requestLoggerMiddleware = (req, res, next) => {
  // Capturar información del request
  const startTime = Date.now();
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  const method = req.method;
  const endpoint = req.originalUrl || req.url;
  const userId = req.user?.user_id || null;

  // Interceptar la respuesta para capturar el status code
  const originalSend = res.send;
  
  res.send = function(data) {
    // Registrar el log de manera asíncrona
    setImmediate(async () => {
      try {
        await RequestLogModel.createLog(
          ipAddress,
          method,
          endpoint,
          userId,
          res.statusCode
        );
      } catch (error) {
        console.error('Error registrando request log:', error);
      }
    });

    // Llamar al método original
    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLoggerMiddleware;