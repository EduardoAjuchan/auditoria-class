import express from "express";
import { generarCodigoMFA, verificarMFA } from "../controllers/mfaController.js";

const router = express.Router();

router.post("/generar", generarCodigoMFA);
router.post("/verificar", verificarMFA);

export default router;
