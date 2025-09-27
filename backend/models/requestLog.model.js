const pool = require('../config/db');

/**
 * Modelo para logging de requests
 */
class RequestLogModel {
  /**
   * Crear log de request
   */
  static async createLog(ipAddress, method, endpoint, userId, statusCode) {
    const [result] = await pool.execute(`
      INSERT INTO request_logs (ip_address, method, endpoint, user_id, status_code) 
      VALUES (?, ?, ?, ?, ?)
    `, [ipAddress, method, endpoint, userId, statusCode]);
    return result.insertId;
  }

  /**
   * Obtener logs por endpoint
   */
  static async getLogsByEndpoint(endpoint, limit = 100) {
    const [rows] = await pool.execute(`
      SELECT * FROM request_logs 
      WHERE endpoint = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [endpoint, limit]);
    return rows;
  }

  /**
   * Obtener logs por IP
   */
  static async getLogsByIP(ipAddress, limit = 100) {
    const [rows] = await pool.execute(`
      SELECT * FROM request_logs 
      WHERE ip_address = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [ipAddress, limit]);
    return rows;
  }

  /**
   * Obtener estadísticas de requests por endpoint
   */
  static async getEndpointStats() {
    const [rows] = await pool.execute(`
      SELECT 
        endpoint,
        COUNT(*) as total_requests,
        COUNT(DISTINCT ip_address) as unique_ips,
        AVG(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) * 100 as success_rate
      FROM request_logs 
      GROUP BY endpoint 
      ORDER BY total_requests DESC
    `);
    return rows;
  }

  /**
   * Obtener estadísticas por IP
   */
  static async getIPStats() {
    const [rows] = await pool.execute(`
      SELECT 
        ip_address,
        COUNT(*) as total_requests,
        COUNT(DISTINCT endpoint) as unique_endpoints,
        MAX(created_at) as last_request
      FROM request_logs 
      GROUP BY ip_address 
      ORDER BY total_requests DESC
      LIMIT 50
    `);
    return rows;
  }

  /**
   * Obtener logs de autenticación fallidos por IP
   */
  static async getFailedAuthByIP(ipAddress) {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) as failed_attempts
      FROM request_logs 
      WHERE ip_address = ? 
        AND endpoint LIKE '%/auth/%' 
        AND status_code >= 400
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `, [ipAddress]);
    return rows[0]?.failed_attempts || 0;
  }
}

module.exports = RequestLogModel;