const express = require('express');
const router = express.Router();
const { requireBody } = require('../middleware/validate');
const roleMiddleware = require('../middleware/roles');
const { listVehicles, getById, create, patch, enable, disable } = require('../services/vehicles.service');

// GET /api/vehicles?brand=&status=&yearFrom=&yearTo=&includeInactive=&page=&pageSize=
// Visitantes y superiores pueden ver el catálogo (solo activos para visitantes)
router.get('/', roleMiddleware.requireAuth(), async (req, res) => {
  try {
    // Visitantes no pueden ver vehículos inactivos
    if (req.user.role === 'VISITOR') {
      req.query.includeInactive = false;
    }
    
    const r = await listVehicles(req.query);
    if (!r.ok) return res.status(400).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// GET /api/vehicles/:id
// Visitantes y superiores pueden ver detalles (solo activos para visitantes)
router.get('/:id', roleMiddleware.requireAuth(), async (req, res) => {
  try {
    // Visitantes no pueden ver vehículos inactivos
    const includeInactive = req.user.role !== 'VISITOR' && req.query.includeInactive;
    
    const r = await getById(Number(req.params.id), includeInactive ? 1 : 0);
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles  (crear) - Solo administradores y super-admin
router.post('/',
  roleMiddleware.requireAdmin(),
  requireBody(['brand','model','plate','yearMade','price']),
  async (req, res) => {
    try {
      const r = await create(req.body);
      if (!r.ok) return res.status(400).json(r);
      res.status(201).json(r);
    } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
  }
);

// PATCH /api/vehicles/:id  (actualizar) - Solo administradores y super-admin
router.patch('/:id', roleMiddleware.requireAdmin(), async (req, res) => {
  try {
    const r = await patch(Number(req.params.id), req.body);
    if (!r.ok) return res.status(400).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles/:id/enable   (habilitar) - Solo administradores y super-admin
router.post('/:id/enable', roleMiddleware.requireAdmin(), async (req, res) => {
  try {
    const r = await enable(Number(req.params.id));
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles/:id/disable  (deshabilitar) - Solo administradores y super-admin
router.post('/:id/disable', roleMiddleware.requireAdmin(), async (req, res) => {
  try {
    const r = await disable(Number(req.params.id));
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

module.exports = router;
