import express from "express";
import {
  listarVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} from "../controllers/vehiculosController.js";
import { verificarToken } from "../middlewares/verificarToken.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

// Visitantes solo pueden ver
router.get("/", verificarToken, listarVehiculos);

// Admin o Superadmin pueden modificar
router.post("/", verificarToken, verificarRol(["admin", "superadmin"]), crearVehiculo);
router.put("/:id", verificarToken, verificarRol(["admin", "superadmin"]), actualizarVehiculo);
router.delete("/:id", verificarToken, verificarRol(["admin", "superadmin"]), eliminarVehiculo);

export default router;
