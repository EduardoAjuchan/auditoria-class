import connection from "../config/db.js";

// ✅ Listar vehículos (solo los no eliminados)
export const listarVehiculos = (req, res) => {
  const query = "SELECT * FROM vehiculos WHERE eliminado = 0";
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener vehículos" });
    res.json(results);
  });
};

// ✅ Crear vehículo
export const crearVehiculo = (req, res) => {
  const { marca, modelo, año, precio, estado, kilometraje, color } = req.body;
  const query = `
    INSERT INTO vehiculos (marca, modelo, año, precio, estado, kilometraje, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(query, [marca, modelo, año, precio, estado, kilometraje, color], (err) => {
    if (err) return res.status(500).json({ error: "Error al crear vehículo" });
    res.status(201).json({ message: "Vehículo agregado correctamente" });
  });
};

// ✅ Actualizar vehículo
export const actualizarVehiculo = (req, res) => {
  const { id } = req.params;
  const { marca, modelo, año, precio, estado, kilometraje, color } = req.body;
  const query = `
    UPDATE vehiculos SET marca=?, modelo=?, año=?, precio=?, estado=?, kilometraje=?, color=? 
    WHERE id_vehiculo=?
  `;
  connection.query(query, [marca, modelo, año, precio, estado, kilometraje, color, id], (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar vehículo" });
    res.json({ message: "Vehículo actualizado correctamente" });
  });
};

// ✅ Eliminación lógica
export const eliminarVehiculo = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE vehiculos SET eliminado = 1 WHERE id_vehiculo = ?";
  connection.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar vehículo" });
    res.json({ message: "Vehículo eliminado (soft delete)" });
  });
};
