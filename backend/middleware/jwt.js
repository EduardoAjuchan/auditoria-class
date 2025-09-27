const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
 * Middleware para validar JWT con claims personalizados
 */
const validateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token de autorización requerido' 
    });
  }

  const token = authHeader.substring(7); // Remover 'Bearer '

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar claims requeridos
    if (!decoded.user_id || !decoded.username || !decoded.role) {
      return res.status(401).json({ 
        error: 'Token inválido: claims faltantes' 
      });
    }

    // Verificar issuer y audience
    if (decoded.iss !== 'auditoria-system' || decoded.aud !== 'auditoria-app') {
      return res.status(401).json({ 
        error: 'Token inválido: emisor o audiencia incorrectos' 
      });
    }

    // Agregar información del usuario al request
    req.user = {
      user_id: decoded.user_id,
      username: decoded.username,
      role: decoded.role,
      role_id: decoded.role_id
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        expired: true
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    } else {
      console.error('Error validando JWT:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
};

module.exports = validateJWT;