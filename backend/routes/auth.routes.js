const express = require('express');
const router = express.Router();
const { requireBody } = require('../middleware/validate');
const { antibruteForceMiddleware } = require('../middleware/antibruteforce');
const roleMiddleware = require('../middleware/roles');
const {
  loginBasic, loginHash, loginGoogle,
  registerBasic, registerHash
} = require('../services/auth.service');
const MFAService = require('../services/mfa.service');
const AuditService = require('../services/audit.service');

// ===== Logins con Anti-Brute Force =====
router.post('/login/basic', antibruteForceMiddleware, requireBody(['username', 'password']), async (req, res) => {
  const { username, password, totp_code } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  
  try {
    const r = await loginBasic(username, password, totp_code, ipAddress);
    if (!r.ok) return res.status(401).json(r);
    return res.json(r);
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
});

router.post('/login/hash', antibruteForceMiddleware, requireBody(['username', 'password']), async (req, res) => {
  const { username, password, totp_code } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  
  try {
    const r = await loginHash(username, password, totp_code, ipAddress);
    if (!r.ok) return res.status(401).json(r);
    return res.json(r);
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
});

router.post('/login/google', requireBody(['idToken']), async (req, res) => {
  const { idToken } = req.body;
  try {
    const r = await loginGoogle(idToken);
    if (!r.ok) return res.status(401).json(r);
    return res.json(r);
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
});

// ===== Endpoints utilitarios de registro (para pruebas) =====
// Plain
router.post('/register/basic', requireBody(['username','email','password']), async (req,res)=>{
  const { username, email, password } = req.body;
  try {
    const r = await registerBasic(username, email, password);
    res.json(r);
  } catch(e){ res.status(500).json({ ok:false, error:e.message }); }
});

// Hash (bcrypt|md5|sha256)
router.post('/register/hash', requireBody(['username','email','password','algo']), async (req,res)=>{
  const { username, email, password, algo } = req.body;
  try {
    const r = await registerHash(username, email, password, algo);
    res.json(r);
  } catch(e){ res.status(500).json({ ok:false, error:e.message }); }
});

// ===== MFA Endpoints =====
// Generar configuración MFA
router.post('/mfa/setup', roleMiddleware.requireAuth(), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const username = req.user.username;
    
    const mfaConfig = await MFAService.generateMFASecret(userId, username);
    res.json({ success: true, ...mfaConfig });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Habilitar MFA
router.post('/mfa/enable', roleMiddleware.requireAuth(), requireBody(['totp_code']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { totp_code } = req.body;
    
    const result = await MFAService.enableMFA(userId, totp_code);
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({ success: true, message: 'MFA habilitado correctamente' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Deshabilitar MFA
router.post('/mfa/disable', roleMiddleware.requireAuth(), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await MFAService.disableMFA(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({ success: true, message: 'MFA deshabilitado correctamente' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Estado MFA del usuario
router.get('/mfa/status', roleMiddleware.requireAuth(), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const status = await MFAService.getMFAStatus(userId);
    res.json({ success: true, ...status });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ===== Dashboard de Auditoría (Solo Super-Admin) =====
// Estadísticas generales
router.get('/audit/stats', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const stats = await AuditService.getSystemStats();
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Logs de autenticación
router.get('/audit/auth-logs', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditService.getAuthLogs(limit);
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// IPs sospechosas
router.get('/audit/suspicious-ips', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const ips = await AuditService.getSuspiciousIPs();
    res.json({ success: true, data: ips });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Actividad de usuarios
router.get('/audit/user-activity', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await AuditService.getUserActivity(limit);
    res.json({ success: true, data: activity });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Estadísticas por endpoint
router.get('/audit/endpoint-stats', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const stats = await AuditService.getEndpointStats();
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Tendencias horarias
router.get('/audit/hourly-trends', roleMiddleware.requireSuperAdmin(), async (req, res) => {
  try {
    const trends = await AuditService.getHourlyTrends();
    res.json({ success: true, data: trends });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
