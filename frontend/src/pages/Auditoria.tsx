import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerToken } from "../utils/auth";

interface Registro {
  id_auditoria: number;
  usuario: string;
  ip_cliente: string;
  endpoint: string;
  metodo_http: string;
  status_code: number;
  fecha: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Auditoria() {
  const [logs, setLogs] = useState<Registro[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      cerrarSesion();
      navigate("/login-basico");
      return;
    }

    axios
      .get(`${API_URL}/auditoria`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLogs(res.data))
      .catch(() => {
        alert("Acceso denegado o sesión expirada"); 
        cerrarSesion();
        navigate("/login-basico");
      });
  }, [navigate]);

  return (
    <div className="card">
      <h2>Dashboard de Auditoría</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>IP</th>
            <th>Endpoint</th>
            <th>Método</th>
            <th>Status</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id_auditoria}>
              <td>{l.id_auditoria}</td>
              <td>{l.usuario || "Anónimo"}</td>
              <td>{l.ip_cliente}</td>
              <td>{l.endpoint}</td>
              <td>{l.metodo_http}</td>
              <td>{l.status_code}</td>
              <td>{new Date(l.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
