import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { guardarSesion } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginCifrado() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [, setRequiresSetup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/loginSeguro`, { email, password });
      const data = res.data;
      setIdUsuario(data.id_usuario);

      if (data.requiresOtpSetup) {
        setRequiresSetup(true);
        Swal.fire({
          title: "Configura tu autenticador",
          html: `
            <p>Escanea este código QR con Google Authenticator o Authy.</p>
            <img src="${data.qrImage}" alt="QR OTP" width="200" />
            <p><b>Luego ingresa el código que se genere.</b></p>
          `,
          confirmButtonText: "Listo",
        });
      } else {
        Swal.fire({
          title: "Autenticación requerida",
          text: data.message,
          icon: "info",
          confirmButtonText: "Ingresar código OTP",
        });
      }
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || "Error al iniciar sesión", "error");
    }
  };

  const verificarCodigo = async () => {
    const { value: otp } = await Swal.fire({
      title: "Verificar código OTP",
      input: "text",
      inputPlaceholder: "Ingresa el código de tu autenticador",
      confirmButtonText: "Verificar",
      showCancelButton: true,
    });

    if (!otp) return;

    try {
      const res = await axios.post(`${API_URL}/auth/verificarOtp`, {
        id_usuario: idUsuario,
        codigo: otp,
      });

      guardarSesion(res.data.token, res.data.usuario);
      Swal.fire("Éxito", "Inicio de sesión completado correctamente", "success");
      navigate("/inventario");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || "Código incorrecto", "error");
    }
  };

  return (
    <div className="card">
      <h2>Login Seguro (con Autenticador)</h2>
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
      <button onClick={handleLogin}>Iniciar Sesión</button>

      {idUsuario && (
        <button style={{ marginTop: "10px" }} onClick={verificarCodigo}>
          Ingresar Código OTP
        </button>
      )}
    </div>
  );
}
