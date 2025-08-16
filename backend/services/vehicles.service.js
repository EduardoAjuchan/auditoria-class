const { toVehicle } = require('../models/vehicle.model');
const {
  plateExists, findVehicles, getVehicleById,
  createVehicle, updateVehicle, enableVehicle, disableVehicle
} = require('../data/vehicles.data');

const ALLOWED_STATUS = ['DISPONIBLE', 'VENDIDO', 'MANTENIMIENTO'];
const validateStatus = (s) => !s || ALLOWED_STATUS.includes(s);

async function listVehicles(query) {
  const { brand, status, yearFrom, yearTo, includeInactive, page, pageSize } = query;
  if (!validateStatus(status)) {
    return { ok: false, error: 'STATUS inválido. Use: DISPONIBLE | VENDIDO | MANTENIMIENTO' };
  }
  const result = await findVehicles({
    brand: brand || undefined,
    status: status || undefined,
    yearFrom: yearFrom ? Number(yearFrom) : undefined,
    yearTo: yearTo ? Number(yearTo) : undefined,
    includeInactive: includeInactive ? 1 : 0,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 20,
  });
  return { ok: true, total: result.total, page: result.page, pageSize: result.pageSize, data: result.rows.map(toVehicle) };
}

async function getById(id, includeInactive = 0) {
  const row = await getVehicleById(id, includeInactive ? 1 : 0);
  if (!row) return { ok: false, error: 'Vehículo no encontrado' };
  return { ok: true, data: toVehicle(row) };
}

async function create(payload) {
  const { brand, model, plate, yearMade, price, status, mileageKm, color } = payload;

  if (!brand || !model || !plate || !yearMade || !price) {
    return { ok: false, error: 'Campos obligatorios: brand, model, plate, yearMade, price' };
  }
  if (!validateStatus(status)) {
    return { ok: false, error: 'STATUS inválido. Use: DISPONIBLE | VENDIDO | MANTENIMIENTO' };
  }
  // Placa única
  if (await plateExists(plate)) {
    return { ok: false, error: 'La placa ya existe' };
  }

  const id = await createVehicle({
    brand, model, plate,
    yearMade: Number(yearMade),
    price: Number(price),
    status: status || 'DISPONIBLE',
    mileageKm: mileageKm != null ? Number(mileageKm) : null,
    color: color || null
  });

  const row = await getVehicleById(id, 1);
  return { ok: true, data: toVehicle(row) };
}

async function patch(id, payload) {
  if (payload.status && !validateStatus(payload.status)) {
    return { ok: false, error: 'STATUS inválido. Use: DISPONIBLE | VENDIDO | MANTENIMIENTO' };
  }
  if (payload.yearMade != null) payload.yearMade = Number(payload.yearMade);
  if (payload.price != null) payload.price = Number(payload.price);
  if (payload.mileageKm != null) payload.mileageKm = Number(payload.mileageKm);

  // Si cambia placa, verificar unicidad
  if (payload.plate) {
    if (await plateExists(payload.plate, id)) {
      return { ok: false, error: 'La placa ya existe' };
    }
  }

  const affected = await updateVehicle(id, payload);
  if (!affected) return { ok: false, error: 'Nada que actualizar o vehículo no encontrado/activo' };

  const row = await getVehicleById(id, 1);
  return { ok: true, data: toVehicle(row) };
}

async function enable(id) {
  const affected = await enableVehicle(id);
  if (!affected) return { ok: false, error: 'Vehículo no encontrado o ya activo' };
  const row = await getVehicleById(id, 1);
  return { ok: true, data: toVehicle(row) };
}

async function disable(id) {
  const affected = await disableVehicle(id);
  if (!affected) return { ok: false, error: 'Vehículo no encontrado o ya inactivo' };
  return { ok: true };
}

module.exports = { listVehicles, getById, create, patch, enable, disable };
