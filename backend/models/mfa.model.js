const pool = require('../config/db');

/**
 * Modelo para gestión de autenticación multi-factor (MFA)
 */
class MFAModel {
  /**
   * Crear nuevo secreto MFA para usuario
   */
  static async createMFASecret(userId, secret) {
    const [result] = await pool.execute(`
      INSERT INTO mfa_secrets (user_id, secret, is_enabled) 
      VALUES (?, ?, 0)
    `, [userId, secret]);
    return result.insertId;
  }

  /**
   * Obtener secreto MFA por usuario
   */
  static async getMFAByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM mfa_secrets WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  /**
   * Habilitar MFA para usuario
   */
  static async enableMFA(userId) {
    const [result] = await pool.execute(
      'UPDATE mfa_secrets SET is_enabled = 1 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Deshabilitar MFA para usuario
   */
  static async disableMFA(userId) {
    const [result] = await pool.execute(
      'UPDATE mfa_secrets SET is_enabled = 0 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Verificar si usuario tiene MFA habilitado
   */
  static async isMFAEnabled(userId) {
    const [rows] = await pool.execute(
      'SELECT is_enabled FROM mfa_secrets WHERE user_id = ? AND is_enabled = 1',
      [userId]
    );
    return rows.length > 0;
  }

  /**
   * Eliminar MFA para usuario
   */
  static async deleteMFA(userId) {
    const [result] = await pool.execute(
      'DELETE FROM mfa_secrets WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = MFAModel;