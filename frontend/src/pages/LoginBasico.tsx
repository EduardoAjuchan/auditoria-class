import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { guardarSesion } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginBasico() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/loginBasico`, { email, password });
      alert(res.data.message);

      // ✅ Guardar token y usuario
      guardarSesion(res.data.token, res.data.usuario);

      navigate("/inventario");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al iniciar sesión.");
    }
  };

  return (
    <div className="card">
      <h2>Login Básico</h2>
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
}
