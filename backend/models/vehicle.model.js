function toVehicle(row) {
  if (!row) return null;
  return {
    vehicleId: row.vehicle_id,
    brand: row.brand,
    model: row.model,
    plate: row.plate,
    yearMade: Number(row.year_made),
    price: Number(row.price),
    status: row.status,
    mileageKm: row.mileage_km != null ? Number(row.mileage_km) : null,
    color: row.color,
    isActive: !!row.is_active,
    createdAt: row.created_at
  };
}
module.exports = { toVehicle };
