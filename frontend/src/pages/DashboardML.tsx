import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerToken } from "../utils/auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface Anomalia {
  ip_cliente: string;
  ventana_inicio: string;
  puntaje_anomalia: number;
}

interface TopSospechosa {
  ip_cliente: string;
  veces_anomala: number;
  promedio_score: number;
}

interface Metrica {
  ip_cliente: string;
  ventana_inicio: string;
  requests_total: number;
  intentos_fallidos: number;
  ratio_fallos: number;
  promedio_respuesta_ms: number;
  es_anomalia?: boolean;
  puntaje_anomalia?: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardML() {
  const [anomalias, setAnomalias] = useState<Anomalia[]>([]);
  const [topIPs, setTopIPs] = useState<TopSospechosa[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [ipSeleccionada, setIpSeleccionada] = useState<string | null>(null);
  const [detalleIP, setDetalleIP] = useState<Metrica[]>([]);
  const navigate = useNavigate();

  // 🚀 Cargar datos iniciales del dashboard
  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      navigate("/login-basico");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_URL}/ml/anomalias`, { headers }),
      axios.get(`${API_URL}/ml/top-sospechosas`, { headers }),
      axios.get(`${API_URL}/ml/metricas`, { headers }),
    ])
      .then(([anomaliasRes, topRes, metricasRes]) => {
        setAnomalias(anomaliasRes.data);
        setTopIPs(topRes.data);
        setMetricas(metricasRes.data);
      })
      .catch(() => {
        alert("Error cargando dashboard o sesión expirada.");
        cerrarSesion();
        alert("Sesión cerrada correctamente.");
        navigate("/login-basico");
      });
  }, [navigate]);

  // 🔍 Ver detalle por IP
  const verDetalle = async (ip: string) => {
    const token = obtenerToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`${API_URL}/ml/ip/${ip}`, { headers });
      setDetalleIP(res.data);
      setIpSeleccionada(ip);
    } catch {
      alert("No se pudo obtener el detalle de la IP.");
    }
  };

  // 📊 Preparar datos para las gráficas
  const tendenciaDatos = metricas
    .slice(-20)
    .map((m) => ({
      ventana: new Date(m.ventana_inicio).toLocaleTimeString(),
      requests: m.requests_total,
      fallos: m.intentos_fallidos,
    }));

  const radarDatos = topIPs.map((ip) => ({
    ip: ip.ip_cliente,
    score: ip.promedio_score,
  }));

  // 🖼 Render principal
  return (
    <div className="card">
      <h2>📊 Dashboard de Detección ML</h2>

      {metricas.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa" }}>
          Cargando métricas de detección automática...
        </p>
      )}

      {/* 🔹 Gráfica 1: Tendencia de Requests */}
      <section>
        <h3>Tendencia de Intentos de Login (últimas ventanas)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tendenciaDatos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ventana" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#00c3ff" name="Requests/min" />
            <Line type="monotone" dataKey="fallos" stroke="#ff4f4f" name="Fallos/min" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 🔹 Gráfica 2: Top 10 IPs Sospechosas */}
      <section>
        <h3>Top 10 IPs Sospechosas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topIPs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ip_cliente" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="veces_anomala" fill="#ff9800" name="Veces Anómala" />
            <Bar dataKey="promedio_score" fill="#0078d4" name="Promedio Score" />
          </BarChart>
        </ResponsiveContainer>
        <table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Veces Anómala</th>
              <th>Promedio Score</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {topIPs.length === 0 ? (
              <tr><td colSpan={4}>Sin datos</td></tr>
            ) : (
              topIPs.map((ip) => (
                <tr key={ip.ip_cliente}>
                  <td>{ip.ip_cliente}</td>
                  <td>{ip.veces_anomala}</td>
                  <td>{ip.promedio_score.toFixed(4)}</td>
                  <td>
                    <button onClick={() => verDetalle(ip.ip_cliente)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 🔹 Gráfica 3: Radar de Scores Promedio */}
      <section>
        <h3>Promedio de Puntaje por IP (Radar)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarDatos}>
            <PolarGrid />
            <PolarAngleAxis dataKey="ip" />
            <PolarRadiusAxis angle={30} domain={[0, 1]} />
            <Radar
              name="Puntaje Promedio"
              dataKey="score"
              stroke="#61dafb"
              fill="#61dafb"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* 🔹 Tabla: Listado de Anomalías */}
      <section>
        <h3>Listado de Anomalías Detectadas</h3>
        <table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Ventana</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {anomalias.length === 0 ? (
              <tr><td colSpan={3}>Sin datos</td></tr>
            ) : (
              anomalias.map((a, i) => (
                <tr key={i}>
                  <td>{a.ip_cliente}</td>
                  <td>{new Date(a.ventana_inicio).toLocaleString()}</td>
                  <td>{a.puntaje_anomalia.toFixed(4)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 🔹 Detalle por IP */}
      {ipSeleccionada && (
        <section>
          <h3>Detalle de IP: {ipSeleccionada}</h3>
          <button
            style={{
              backgroundColor: "#ff4f4f",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "10px",
              cursor: "pointer"
            }}
            onClick={() => setIpSeleccionada(null)}
          >
            ← Volver al dashboard
          </button>
          <table>
            <thead>
              <tr>
                <th>Ventana</th>
                <th>Requests/min</th>
                <th>Fallos</th>
                <th>Ratio</th>
                <th>Prom. Respuesta</th>
                <th>Anómalo</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {detalleIP.length === 0 ? (
                <tr><td colSpan={7}>Sin datos</td></tr>
              ) : (
                detalleIP.map((d) => (
                  <tr key={d.ventana_inicio}>
                    <td>{new Date(d.ventana_inicio).toLocaleTimeString()}</td>
                    <td>{d.requests_total}</td>
                    <td>{d.intentos_fallidos}</td>
                    <td>{d.ratio_fallos}</td>
                    <td>{d.promedio_respuesta_ms?.toFixed(2)}</td>
                    <td>{d.es_anomalia ? "⚠️ Sí" : "✔️ No"}</td>
                    <td>{d.puntaje_anomalia?.toFixed(4) ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
