const { pool } = require('../config/db');

// Verifica si existe una placa (opcionalmente excluyendo un id)
async function plateExists(plate, excludeId = null) {
  if (excludeId) {
    const [rows] = await pool.query(
      'SELECT vehicle_id FROM vehicles WHERE plate = ? AND vehicle_id <> ? LIMIT 1',
      [plate, excludeId]
    );
    return rows.length > 0;
  }
  const [rows] = await pool.query(
    'SELECT vehicle_id FROM vehicles WHERE plate = ? LIMIT 1',
    [plate]
  );
  return rows.length > 0;
}

// Listado con filtros (solo activos por defecto)
async function findVehicles({ brand, status, yearFrom, yearTo, includeInactive = 0, page = 1, pageSize = 20 }) {
  const where = [];
  const params = [];

  if (!Number(includeInactive)) { where.push('is_active = 1'); }
  if (brand) { where.push('brand LIKE ?'); params.push(`%${brand}%`); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (yearFrom) { where.push('year_made >= ?'); params.push(yearFrom); }
  if (yearTo) { where.push('year_made <= ?'); params.push(yearTo); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Math.max(1, Number(pageSize));
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM vehicles ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total } = { total: 0 }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM vehicles ${whereSql}`, params
  );

  return { rows, total, page: Number(page), pageSize: limit };
}

async function getVehicleById(id, includeInactive = 0) {
  const clause = Number(includeInactive) ? '' : 'AND is_active = 1';
  const [rows] = await pool.query(
    `SELECT * FROM vehicles WHERE vehicle_id = ? ${clause} LIMIT 1`, [id]
  );
  return rows[0] || null;
}

async function createVehicle({ brand, model, plate, yearMade, price, status = 'DISPONIBLE', mileageKm = null, color = null }) {
  const [r] = await pool.query(
    `INSERT INTO vehicles (brand, model, plate, year_made, price, status, mileage_km, color)
     VALUES (?,?,?,?,?,?,?,?)`,
    [brand, model, plate, yearMade, price, status, mileageKm, color]
  );
  return r.insertId;
}

async function updateVehicle(id, fields) {
  const sets = [];
  const params = [];
  const map = {
    brand: 'brand',
    model: 'model',
    plate: 'plate',
    yearMade: 'year_made',
    price: 'price',
    status: 'status',
    mileageKm: 'mileage_km',
    color: 'color'
  };

  Object.entries(fields).forEach(([k, v]) => {
    if (v === undefined) return;
    const col = map[k];
    if (!col) return;
    sets.push(`${col} = ?`);
    params.push(v);
  });

  if (!sets.length) return 0;

  params.push(id);
  const [r] = await pool.query(
    `UPDATE vehicles SET ${sets.join(', ')} WHERE vehicle_id = ? AND is_active = 1`, params
  );
  return r.affectedRows;
}

async function enableVehicle(id) {
  const [r] = await pool.query(
    'UPDATE vehicles SET is_active = 1 WHERE vehicle_id = ? AND is_active = 0', [id]
  );
  return r.affectedRows;
}

async function disableVehicle(id) {
  const [r] = await pool.query(
    'UPDATE vehicles SET is_active = 0 WHERE vehicle_id = ? AND is_active = 1', [id]
  );
  return r.affectedRows;
}

module.exports = {
  plateExists,
  findVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  enableVehicle,
  disableVehicle,
};
