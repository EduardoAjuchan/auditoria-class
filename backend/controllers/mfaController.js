import connection from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Generar código MFA
export const generarCodigoMFA = (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) return res.status(400).json({ message: "Usuario no válido" });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracion = new Date(Date.now() + 2 * 60 * 1000);

  const query = `
    INSERT INTO codigos_mfa (id_usuario, codigo, expiracion)
    VALUES (?, ?, ?)
  `;
  connection.query(query, [id_usuario, codigo, expiracion], (err) => {
    if (err) return res.status(500).json({ error: "Error generando MFA" });
    console.log(`📧 Código MFA para ${id_usuario}: ${codigo}`);
    res.json({ message: "Código MFA generado (ver consola del servidor)" });
  });
};

// Verificar MFA y emitir token JWT
export const verificarMFA = (req, res) => {
  const { id_usuario, codigo } = req.body;
  const query = `
    SELECT * FROM codigos_mfa 
    WHERE id_usuario = ? AND codigo = ? AND expiracion > NOW() AND verificado = 0
    ORDER BY id DESC LIMIT 1
  `;
  connection.query(query, [id_usuario, codigo], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al validar MFA" });
    if (results.length === 0)
      return res.status(401).json({ message: "Código inválido o expirado" });

    connection.query("UPDATE codigos_mfa SET verificado = 1 WHERE id = ?", [results[0].id]);
    const queryUser = "SELECT * FROM usuarios WHERE id_usuario = ?";
    connection.query(queryUser, [id_usuario], (err2, users) => {
      if (err2 || users.length === 0)
        return res.status(500).json({ message: "Usuario no encontrado" });

      const usuario = users[0];
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol,
          tipo_autenticacion: usuario.tipo_autenticacion,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2m" }
      );
      res.json({ message: "MFA verificado correctamente", token, usuario });
    });
  });
};
