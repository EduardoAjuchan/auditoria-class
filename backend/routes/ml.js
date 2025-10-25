import express from "express";
import {
  obtenerMetricas,
  obtenerAnomalias,
  obtenerTopSospechosas,
  obtenerDetallePorIP
} from "../controllers/mlController.js";
import { verificarToken } from "../middlewares/verificarToken.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

// Solo el superadmin puede consultar el dashboard ML
router.get("/metricas", verificarToken, verificarRol(["superadmin"]), obtenerMetricas);
router.get("/anomalias", verificarToken, verificarRol(["superadmin"]), obtenerAnomalias);
router.get("/top-sospechosas", verificarToken, verificarRol(["superadmin"]), obtenerTopSospechosas);
router.get("/ip/:ip", verificarToken, verificarRol(["superadmin"]), obtenerDetallePorIP);

export default router;
