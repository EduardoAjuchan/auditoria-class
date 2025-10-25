import express from "express";
import {
  loginBasico,
  loginSeguro,
  loginGoogle,
  registrarUsuario,
  verificarOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/loginBasico", loginBasico);
router.post("/loginSeguro", loginSeguro);
router.post("/loginGoogle", loginGoogle);
router.post("/verificarOtp", verificarOtp); // ✅ nuevo endpoint

export default router;
