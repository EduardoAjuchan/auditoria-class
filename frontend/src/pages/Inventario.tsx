import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerToken } from "../utils/auth";

export interface Vehiculo {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  estado: string;
  kilometraje: number;
  color: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Inventario() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      cerrarSesion();
      navigate("/login-basico");
      return;
    }

    axios
      .get(`${API_URL}/vehiculos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVehiculos(res.data))
      .catch((err) => {
        console.error(err);
        alert("Error al cargar inventario o sesión expirada.");
        cerrarSesion();
        navigate("/login-basico");
      });
  }, [navigate]);

  return (
    <div className="card">
      <h2>Inventario de Vehículos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Kilometraje</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.id_vehiculo}>
              <td>{v.id_vehiculo}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>{v.año}</td>
              <td>Q{v.precio.toLocaleString()}</td>
              <td>{v.estado}</td>
              <td>{v.kilometraje} km</td>
              <td>{v.color}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
