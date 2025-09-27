const pool = require('../config/db');

/**
 * Modelo para gestión de roles de usuario
 */
class RoleModel {
  /**
   * Obtener todos los roles
   */
  static async getAllRoles() {
    const [rows] = await pool.execute('SELECT * FROM roles ORDER BY role_id');
    return rows;
  }

  /**
   * Obtener rol por ID
   */
  static async getRoleById(roleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM roles WHERE role_id = ?',
      [roleId]
    );
    return rows[0];
  }

  /**
   * Obtener rol por nombre
   */
  static async getRoleByName(roleName) {
    const [rows] = await pool.execute(
      'SELECT * FROM roles WHERE role_name = ?',
      [roleName]
    );
    return rows[0];
  }

  /**
   * Obtener usuario con su rol
   */
  static async getUserWithRole(userId) {
    const [rows] = await pool.execute(`
      SELECT u.*, r.role_name, r.role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `, [userId]);
    return rows[0];
  }

  /**
   * Actualizar rol de usuario
   */
  static async updateUserRole(userId, roleId) {
    const [result] = await pool.execute(
      'UPDATE users SET role_id = ? WHERE user_id = ?',
      [roleId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = RoleModel;