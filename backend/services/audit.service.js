const RequestLogModel = require('../models/requestLog.model');
const IPAttemptModel = require('../models/ipAttempt.model');
const pool = require('../config/db');

/**
 * Servicio para gestión de auditoría y métricas
 */
class AuditService {
  /**
   * Obtener estadísticas generales del sistema
   */
  static async getSystemStats() {
    try {
      const [authStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_attempts,
          SUM(success) as successful_logins,
          COUNT(*) - SUM(success) as failed_logins,
          COUNT(DISTINCT CASE WHEN success = 1 THEN user_id END) as unique_users_logged
        FROM login_audit 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      const [requestStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(DISTINCT ip_address) as unique_ips,
          COUNT(DISTINCT endpoint) as unique_endpoints
        FROM request_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      const [blockedIPs] = await pool.execute(`
        SELECT COUNT(*) as blocked_ips
        FROM ip_attempts 
        WHERE blocked_until > NOW()
      `);

      return {
        auth_stats: authStats[0],
        request_stats: requestStats[0],
        security_stats: {
          blocked_ips: blockedIPs[0].blocked_ips
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      throw new Error('Error obteniendo estadísticas');
    }
  }

  /**
   * Obtener logs de autenticación recientes
   */
  static async getAuthLogs(limit = 50) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          la.*,
          u.username,
          u.email
        FROM login_audit la
        LEFT JOIN users u ON la.user_id = u.user_id
        ORDER BY la.created_at DESC
        LIMIT ?
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error obteniendo logs de autenticación:', error);
      throw new Error('Error obteniendo logs de autenticación');
    }
  }

  /**
   * Obtener estadísticas por endpoint
   */
  static async getEndpointStats() {
    try {
      return await RequestLogModel.getEndpointStats();
    } catch (error) {
      console.error('Error obteniendo estadísticas de endpoints:', error);
      throw new Error('Error obteniendo estadísticas de endpoints');
    }
  }

  /**
   * Obtener IPs sospechosas (muchas peticiones fallidas)
   */
  static async getSuspiciousIPs() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          rl.ip_address,
          COUNT(*) as total_requests,
          SUM(CASE WHEN rl.status_code >= 400 THEN 1 ELSE 0 END) as failed_requests,
          MAX(rl.created_at) as last_request,
          ia.attempts_count as login_attempts,
          ia.blocked_until
        FROM request_logs rl
        LEFT JOIN ip_attempts ia ON rl.ip_address = ia.ip_address
        WHERE rl.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY rl.ip_address
        HAVING failed_requests > 10 OR login_attempts > 3
        ORDER BY failed_requests DESC, login_attempts DESC
        LIMIT 20
      `);

      return rows;
    } catch (error) {
      console.error('Error obteniendo IPs sospechosas:', error);
      throw new Error('Error obteniendo IPs sospechosas');
    }
  }

  /**
   * Obtener actividad por usuario
   */
  static async getUserActivity(limit = 20) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          u.user_id,
          u.username,
          u.email,
          r.role_name,
          COUNT(rl.log_id) as total_requests,
          MAX(rl.created_at) as last_activity,
          SUM(CASE WHEN la.success = 1 THEN 1 ELSE 0 END) as successful_logins,
          SUM(CASE WHEN la.success = 0 THEN 1 ELSE 0 END) as failed_logins
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN request_logs rl ON u.user_id = rl.user_id
        LEFT JOIN login_audit la ON u.user_id = la.user_id AND la.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        WHERE rl.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) OR la.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY u.user_id
        ORDER BY total_requests DESC
        LIMIT ?
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error obteniendo actividad de usuarios:', error);
      throw new Error('Error obteniendo actividad de usuarios');
    }
  }

  /**
   * Obtener tendencias por hora del día actual
   */
  static async getHourlyTrends() {
    try {
      const [authTrends] = await pool.execute(`
        SELECT 
          HOUR(created_at) as hour,
          COUNT(*) as total_attempts,
          SUM(success) as successful_attempts
        FROM login_audit 
        WHERE DATE(created_at) = CURDATE()
        GROUP BY HOUR(created_at)
        ORDER BY hour
      `);

      const [requestTrends] = await pool.execute(`
        SELECT 
          HOUR(created_at) as hour,
          COUNT(*) as total_requests,
          COUNT(DISTINCT ip_address) as unique_ips
        FROM request_logs 
        WHERE DATE(created_at) = CURDATE()
        GROUP BY HOUR(created_at)
        ORDER BY hour
      `);

      return {
        auth_trends: authTrends,
        request_trends: requestTrends
      };
    } catch (error) {
      console.error('Error obteniendo tendencias horarias:', error);
      throw new Error('Error obteniendo tendencias horarias');
    }
  }
}

module.exports = AuditService;