import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import vehiculoRoutes from "./routes/vehiculos.js";
import auditoriaRoutes from "./routes/auditoria.js";
import { auditoriaMiddleware } from "./middlewares/auditoriaMiddleware.js";
import mfaRoutes from "./routes/mfa.js";
import { verificarBackoff } from "./middlewares/backoffMiddleware.js";
import mlRoutes from "./routes/ml.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ APLICAR backoff solo a autenticaciones
app.use("/auth", verificarBackoff, authRoutes);

// 🧾 Auditoría global (todas las peticiones pasan por aquí)
app.use(auditoriaMiddleware);

// ✅ Otras rutas
app.use("/mfa", mfaRoutes);
app.use("/vehiculos", vehiculoRoutes);
app.use("/auditoria", auditoriaRoutes);
app.use("/ml", mlRoutes);

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en el puerto ${PORT}`));
