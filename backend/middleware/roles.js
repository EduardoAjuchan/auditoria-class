const validateJWT = require('./jwt');

/**
 * Middleware para verificar roles de usuario
 */
const roleMiddleware = {
  /**
   * Verificar si usuario tiene rol específico
   */
  requireRole: (requiredRoles) => {
    return [validateJWT, (req, res, next) => {
      try {
        // El JWT ya fue validado y req.user ya contiene la información de rol
        const userRole = req.user.role;
        
        // Convertir requiredRoles a array si es string
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        
        // Verificar si el usuario tiene alguno de los roles requeridos
        if (!rolesArray.includes(userRole)) {
          return res.status(403).json({ 
            error: 'Permisos insuficientes',
            required: rolesArray,
            current: userRole
          });
        }
        
        next();
      } catch (error) {
        console.error('Error en middleware de roles:', error);
        res.status(500).json({ 
          error: 'Error interno del servidor' 
        });
      }
    }];
  },

  /**
   * Verificar si es administrador o super-administrador
   */
  requireAdmin: function() {
    return this.requireRole(['ADMIN', 'SUPER_ADMIN']);
  },

  /**
   * Verificar si es super-administrador
   */
  requireSuperAdmin: function() {
    return this.requireRole(['SUPER_ADMIN']);
  },

  /**
   * Permitir acceso a visitantes autenticados o superiores
   */
  requireAuth: function() {
    return this.requireRole(['VISITOR', 'ADMIN', 'SUPER_ADMIN']);
  }
};

module.exports = roleMiddleware;