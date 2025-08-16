// Valida campos requeridos en req.body
function requireBody(fields = []) {
  return (req, res, next) => {
    const missing = fields.filter(f => !(f in req.body) || req.body[f] === '');
    if (missing.length) {
      return res.status(400).json({ ok:false, error:`Faltan campos: ${missing.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireBody };
