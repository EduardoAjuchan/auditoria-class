import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginGoogle() {
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    const decoded = JSON.parse(atob(token.split(".")[1]));

    try {
      await axios.post(`${API_URL}/auth/loginGoogle`, {
        email: decoded.email,
        nombre: decoded.name,
      });
      alert("Login con Google exitoso");

      // ✅ Guardar sesión
      localStorage.setItem("usuario", JSON.stringify({ email: decoded.email }));

      navigate("/inventario");
    } catch {
      alert("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Login con Google</h2>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => alert("Error con Google")}
      />
    </div>
  );
}
