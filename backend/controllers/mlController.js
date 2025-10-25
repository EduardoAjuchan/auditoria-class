import connection from "../config/db.js";

// 📊 Obtener las métricas más recientes
export const obtenerMetricas = (req, res) => {
  const query = `
    SELECT ip_cliente, ventana_inicio, requests_total, intentos_fallidos, ratio_fallos,
           tiempo_medio_entre_requests_ms, usuarios_unicos, promedio_respuesta_ms
    FROM ml_features_minute
    ORDER BY ventana_inicio DESC
    LIMIT 100
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener métricas" });
    res.json(results);
  });
};

// 🚨 Obtener todas las anomalías recientes (último día)
export const obtenerAnomalias = (req, res) => {
  const query = `
    SELECT ip_cliente, ventana_inicio, es_anomalia, puntaje_anomalia, version_modelo
    FROM ml_anomalias
    WHERE ventana_inicio >= NOW() - INTERVAL 1 DAY
    ORDER BY ventana_inicio DESC
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener anomalías" });
    res.json(results);
  });
};

// 🧠 Top 10 IPs más sospechosas
export const obtenerTopSospechosas = (req, res) => {
  const query = `
    SELECT ip_cliente, COUNT(*) AS veces_anomala,
           AVG(puntaje_anomalia) AS promedio_score
    FROM ml_anomalias
    WHERE es_anomalia = 1
    GROUP BY ip_cliente
    ORDER BY veces_anomala DESC
    LIMIT 10
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener IPs sospechosas" });
    res.json(results);
  });
};

// 🔍 Obtener historial detallado por IP
export const obtenerDetallePorIP = (req, res) => {
  const ip = req.params.ip;
  const query = `
    SELECT f.ventana_inicio, f.requests_total, f.intentos_fallidos, f.ratio_fallos,
           f.promedio_respuesta_ms, a.es_anomalia, a.puntaje_anomalia
    FROM ml_features_minute f
    LEFT JOIN ml_anomalias a
    ON f.ip_cliente = a.ip_cliente AND f.ventana_inicio = a.ventana_inicio
    WHERE f.ip_cliente = ?
    ORDER BY f.ventana_inicio DESC
    LIMIT 60
  `;

  connection.query(query, [ip], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener detalle de IP" });
    if (!results.length) return res.status(404).json({ message: "No hay datos para esa IP" });
    res.json(results);
  });
};
