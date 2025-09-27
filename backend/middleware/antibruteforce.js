const IPAttemptModel = require('../models/ipAttempt.model');

/**
 * Middleware para protección Anti-Brute Force con Exponential Backoff
 */
const antibruteForceMiddleware = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
    
    if (!ipAddress) {
      return next();
    }

    // Limpiar bloqueos expirados
    await IPAttemptModel.cleanExpiredBlocks();

    // Verificar si la IP está bloqueada
    const blocked = await IPAttemptModel.isIPBlocked(ipAddress);
    if (blocked) {
      const remainingTime = Math.ceil((new Date(blocked.blocked_until) - new Date()) / 1000);
      return res.status(429).json({
        error: 'IP bloqueada temporalmente',
        blocked_until: blocked.blocked_until,
        remaining_seconds: remainingTime
      });
    }

    // Obtener intentos actuales
    const attempts = await IPAttemptModel.getAttemptsByIP(ipAddress);
    
    // Si es el primer intento, continuar
    if (!attempts) {
      req.ipAttempts = { count: 0, ip: ipAddress };
      return next();
    }

    // Calcular tiempo desde último intento
    const lastAttempt = new Date(attempts.last_attempt);
    const timeSinceLastAttempt = (new Date() - lastAttempt) / 1000; // segundos

    // Si han pasado más de 15 minutos, resetear contador
    if (timeSinceLastAttempt > 900) { // 15 minutos
      await IPAttemptModel.resetAttempts(ipAddress);
      req.ipAttempts = { count: 0, ip: ipAddress };
      return next();
    }

    // Verificar límites con Exponential Backoff
    const count = attempts.attempts_count;
    let blockTime = 0;

    if (count >= 3 && count < 5) {
      blockTime = 30; // 30 segundos
    } else if (count >= 5 && count < 10) {
      blockTime = 60; // 1 minuto
    } else if (count >= 10 && count < 20) {
      blockTime = 300; // 5 minutos
    } else if (count >= 20) {
      blockTime = 900; // 15 minutos
    }

    // Si debe ser bloqueado y no ha pasado suficiente tiempo
    if (blockTime > 0 && timeSinceLastAttempt < blockTime) {
      const blockedUntil = new Date(Date.now() + (blockTime * 1000));
      await IPAttemptModel.blockIP(ipAddress, blockedUntil);
      
      return res.status(429).json({
        error: 'Demasiados intentos fallidos',
        attempts: count,
        blocked_until: blockedUntil,
        remaining_seconds: Math.ceil(blockTime - timeSinceLastAttempt)
      });
    }

    req.ipAttempts = { count, ip: ipAddress };
    next();

  } catch (error) {
    console.error('Error en middleware anti-brute force:', error);
    next(); // Continuar en caso de error para no bloquear la aplicación
  }
};

/**
 * Función para registrar intento fallido
 */
const registerFailedAttempt = async (ipAddress) => {
  try {
    if (ipAddress) {
      await IPAttemptModel.createAttempt(ipAddress);
    }
  } catch (error) {
    console.error('Error registrando intento fallido:', error);
  }
};

/**
 * Función para resetear intentos en login exitoso
 */
const resetAttemptsOnSuccess = async (ipAddress) => {
  try {
    if (ipAddress) {
      await IPAttemptModel.resetAttempts(ipAddress);
    }
  } catch (error) {
    console.error('Error reseteando intentos:', error);
  }
};

module.exports = {
  antibruteForceMiddleware,
  registerFailedAttempt,
  resetAttemptsOnSuccess
};