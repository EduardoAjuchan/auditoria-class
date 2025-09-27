const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middleware/roles');
const RoleModel = require('../models/role.model');
const pool = require('../config/db');

// ===== Gestión de Usuarios (Solo Super-Admin) =====

// Obtener todos los usuarios con sus roles
router.get('/', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.created_at,
        r.role_name,
        r.role_id,
        COUNT(la.login_id) as total_logins,
        MAX(la.created_at) as last_login
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN login_audit la ON u.user_id = la.user_id AND la.success = 1
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Obtener usuario específico
router.get('/:id', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await RoleModel.getUserWithRole(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Actualizar rol de usuario
router.patch('/:id/role', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({ success: false, error: 'role_id es requerido' });
    }

    // Verificar que el rol existe
    const role = await RoleModel.getRoleById(role_id);
    if (!role) {
      return res.status(400).json({ success: false, error: 'Rol no válido' });
    }

    // No permitir que el super-admin se cambie su propio rol
    if (userId === req.user.user_id && req.user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ 
        success: false, 
        error: 'No puedes cambiar tu propio rol de super-administrador' 
      });
    }

    const updated = await RoleModel.updateUserRole(userId, role_id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ 
      success: true, 
      message: `Rol actualizado a ${role.role_name}` 
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Obtener todos los roles disponibles
router.get('/roles/list', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const roles = await RoleModel.getAllRoles();
    res.json({ success: true, data: roles });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;