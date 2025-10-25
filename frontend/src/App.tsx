import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";
import LoginBasico from "./pages/LoginBasico";
import LoginCifrado from "./pages/LoginCifrado";
import LoginGoogle from "./pages/LoginGoogle";
import Registro from "./pages/Registro";
import Inventario from "./pages/Inventario";
import Auditoria from "./pages/Auditoria";
import "./styles.css";
import { obtenerToken } from "./utils/auth";
import DashboardML from "./pages/DashboardML";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = obtenerToken();
  return token ? children : <Navigate to="/login-basico" />;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/login-basico" />} />
          <Route path="/login-basico" element={<LoginBasico />} />
          <Route path="/login-cifrado" element={<LoginCifrado />} />
          <Route path="/login-google" element={<LoginGoogle />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditoria"
            element={
              <ProtectedRoute>
                <Auditoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-ml"
            element={
              <ProtectedRoute>
                <DashboardML />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
