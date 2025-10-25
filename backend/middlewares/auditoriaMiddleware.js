import connection from "../config/db.js";

export function auditoriaMiddleware(req, res, next) {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    const usuarioId = req.usuario ? req.usuario.id_usuario : null;
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.originalUrl;
    const metodo = req.method;
    const status = res.statusCode;

    const query = `
      INSERT INTO auditoria (id_usuario, ip_cliente, endpoint, metodo_http, status_code)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [usuarioId, ip, endpoint, metodo, status], (err) => {
      if (err) console.error("Error registrando auditoría:", err);
    });

    console.log(`📋 [AUDITORÍA] ${metodo} ${endpoint} (${status}) - ${duracion}ms`);
  });

  next();
}
