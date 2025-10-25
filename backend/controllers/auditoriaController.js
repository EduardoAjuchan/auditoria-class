import connection from "../config/db.js";

export const obtenerAuditoria = (req, res) => {
  const query = `
    SELECT a.id_auditoria, u.nombre AS usuario, a.ip_cliente, a.endpoint, 
           a.metodo_http, a.status_code, a.fecha
    FROM auditoria a
    LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
    ORDER BY a.fecha DESC
    LIMIT 100
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener auditoría" });
    res.json(results);
  });
};
