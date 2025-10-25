import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Añadimos info del usuario al request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}
