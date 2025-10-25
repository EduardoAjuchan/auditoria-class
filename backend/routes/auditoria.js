import express from "express";
import { obtenerAuditoria } from "../controllers/auditoriaController.js";
import { verificarToken } from "../middlewares/verificarToken.js";
import { verificarRol } from "../middlewares/verificarRol.js";

const router = express.Router();

// Solo superadmin puede ver auditoría
router.get("/", verificarToken, verificarRol(["superadmin"]), obtenerAuditoria);

export default router;
