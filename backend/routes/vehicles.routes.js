const express = require('express');
const router = express.Router();
const { requireBody } = require('../middleware/validate');
const { listVehicles, getById, create, patch, enable, disable } = require('../services/vehicles.service');

// GET /api/vehicles?brand=&status=&yearFrom=&yearTo=&includeInactive=&page=&pageSize=
router.get('/', async (req, res) => {
  try {
    const r = await listVehicles(req.query);
    if (!r.ok) return res.status(400).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await getById(Number(req.params.id), req.query.includeInactive ? 1 : 0);
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles  (crear)
router.post('/',
  requireBody(['brand','model','plate','yearMade','price']),
  async (req, res) => {
    try {
      const r = await create(req.body);
      if (!r.ok) return res.status(400).json(r);
      res.status(201).json(r);
    } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
  }
);

// PATCH /api/vehicles/:id  (actualizar)
router.patch('/:id', async (req, res) => {
  try {
    const r = await patch(Number(req.params.id), req.body);
    if (!r.ok) return res.status(400).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles/:id/enable   (habilitar)
router.post('/:id/enable', async (req, res) => {
  try {
    const r = await enable(Number(req.params.id));
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// POST /api/vehicles/:id/disable  (deshabilitar)
router.post('/:id/disable', async (req, res) => {
  try {
    const r = await disable(Number(req.params.id));
    if (!r.ok) return res.status(404).json(r);
    res.json(r);
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

module.exports = router;
