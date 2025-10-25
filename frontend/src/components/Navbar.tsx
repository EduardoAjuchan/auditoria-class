import { Link, useNavigate } from "react-router-dom";
import "../styles.css";
import { obtenerUsuario, cerrarSesion } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  const handleLogout = () => {
    cerrarSesion();
    alert("Sesión cerrada correctamente.");
    navigate("/login-basico");
  };

  return (
    <nav className="navbar">
      <h1>Sistema de Autenticación</h1>
      <div className="navbar-links">
        {!usuario && (
          <>
            <Link to="/registro">Registrar</Link>
            <Link to="/login-basico">Básico</Link>
            <Link to="/login-cifrado">Seguro (MFA)</Link>
            <Link to="/login-google">Google</Link>
          </>
        )}
        {usuario && (
          <>
            <Link to="/inventario">Inventario</Link>
            {usuario.rol === "superadmin" && <Link to="/auditoria">Auditoría</Link>}
            {usuario.rol === "superadmin" && <Link to="/dashboard-ml">ML Dashboard</Link>}
            <a href="#" onClick={handleLogout}>
              Cerrar sesión
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
