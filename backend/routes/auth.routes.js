const express = require('express');
const router = express.Router();
const { requireBody } = require('../middleware/validate');
const {
  loginBasic, loginHash, loginGoogle,
  registerBasic, registerHash
} = require('../services/auth.service');

// ===== Logins =====
router.post('/login/basic', requireBody(['username', 'password']), async (req, res) => {
  const { username, password } = req.body;
  try {
    const r = await loginBasic(username, password);
    if (!r.ok) return res.status(401).json(r);
    return res.json(r);
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
});

router.post('/login/hash', requireBody(['username', 'password']), async (req, res) => {
  const { username, password } = req.body;
  try {
    const r = await loginHash(username, password);
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

module.exports = router;
