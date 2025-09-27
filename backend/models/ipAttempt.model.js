const pool = require('../config/db');

/**
 * Modelo para gestión de intentos por IP (Anti-Brute Force)
 */
class IPAttemptModel {
  /**
   * Obtener intentos por IP
   */
  static async getAttemptsByIP(ipAddress) {
    const [rows] = await pool.execute(
      'SELECT * FROM ip_attempts WHERE ip_address = ?',
      [ipAddress]
    );
    return rows[0];
  }

  /**
   * Crear nuevo registro de intento
   */
  static async createAttempt(ipAddress) {
    const [result] = await pool.execute(`
      INSERT INTO ip_attempts (ip_address, attempts_count, last_attempt) 
      VALUES (?, 1, NOW())
      ON DUPLICATE KEY UPDATE 
        attempts_count = attempts_count + 1,
        last_attempt = NOW()
    `, [ipAddress]);
    return result;
  }

  /**
   * Bloquear IP por tiempo específico
   */
  static async blockIP(ipAddress, blockedUntil) {
    const [result] = await pool.execute(
      'UPDATE ip_attempts SET blocked_until = ? WHERE ip_address = ?',
      [blockedUntil, ipAddress]
    );
    return result.affectedRows > 0;
  }

  /**
   * Verificar si IP está bloqueada
   */
  static async isIPBlocked(ipAddress) {
    const [rows] = await pool.execute(`
      SELECT blocked_until FROM ip_attempts 
      WHERE ip_address = ? AND blocked_until > NOW()
    `, [ipAddress]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Resetear intentos para IP exitosa
   */
  static async resetAttempts(ipAddress) {
    const [result] = await pool.execute(
      'DELETE FROM ip_attempts WHERE ip_address = ?',
      [ipAddress]
    );
    return result.affectedRows > 0;
  }

  /**
   * Limpiar bloqueos expirados
   */
  static async cleanExpiredBlocks() {
    const [result] = await pool.execute(
      'UPDATE ip_attempts SET blocked_until = NULL WHERE blocked_until <= NOW()'
    );
    return result.affectedRows;
  }
}

module.exports = IPAttemptModel;