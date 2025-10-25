import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("basico");

  const registrar = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/registro`, {
        nombre,
        email,
        password,
        tipo_autenticacion: tipo,
      });
      alert(res.data.message);
    } catch {
      alert("Error al registrar usuario");
    }
  };

  return (
    <div className="card">
      <h2>Registro de Usuario</h2>
      <input
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="basico">Autenticación Básica</option>
        <option value="cifrado">Autenticación Segura (Hash)</option>
      </select>
      <button onClick={registrar}>Registrar Usuario</button>
    </div>
  );
}
