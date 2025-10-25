import bcrypt from "bcrypt";
import connection from "../config/db.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { registrarIntentoFallido, limpiarIntentos } from "../middlewares/backoffMiddleware.js";


// ✅ Función auxiliar para generar JWT
function generarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol,
      tipo_autenticacion: usuario.tipo_autenticacion,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2m" } // 2 minutos
  );
}

// ✅ Registrar log de sesión
function registrarLog(id_usuario, metodo, ip, exito = true, detalles = null) {
  const query = `
    INSERT INTO logs_sesion (id_usuario, metodo, exito, ip_cliente, detalles)
    VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(query, [id_usuario, metodo, exito, ip, detalles]);
}

// ✅ Registro de usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, tipo_autenticacion, rol } = req.body;
    if (!email || !password || !nombre) {
      return res.status(400).json({ message: "Datos incompletos." });
    }

    const existeQuery = "SELECT * FROM usuarios WHERE email = ?";
    connection.query(existeQuery, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Error en la base de datos." });
      if (results.length > 0)
        return res.status(409).json({ message: "El usuario ya existe." });

      let hashedPassword = password;
      if (tipo_autenticacion === "cifrado") {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const insertQuery = `
        INSERT INTO usuarios (nombre, email, password, tipo_autenticacion, rol)
        VALUES (?, ?, ?, ?, ?)
      `;

      connection.query(
        insertQuery,
        [nombre, email, hashedPassword, tipo_autenticacion, rol || "visitante"],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Error al registrar usuario." });
          res.status(201).json({ message: "Usuario registrado correctamente." });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno." });
  }
};

// ✅ Login con contraseña en texto plano
export const loginBasico = (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  const query = "SELECT * FROM usuarios WHERE email = ? AND password = ?";
  connection.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (results.length === 0) {
      registrarIntentoFallido(ip);
      registrarLog(null, "basico", ip, false, "Credenciales incorrectas");
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const usuario = results[0];
    limpiarIntentos(ip); // ✅ limpia si el login fue exitoso
    registrarLog(usuario.id_usuario, "basico", ip, true);

    const token = generarToken(usuario);
    console.log(`🔑 Token JWT emitido (expira en 2m): ${token}`);
    res.json({ message: "Login básico exitoso", token, usuario });
  });
};


// ✅ Login seguro con bcrypt
export const loginSeguro = (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  const query = "SELECT * FROM usuarios WHERE email = ?";
  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (results.length === 0) {
      registrarIntentoFallido(ip);
      console.warn(`❌ Intento con email no registrado desde ${ip}`);
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      registrarIntentoFallido(ip);
      console.warn(`❌ Contraseña incorrecta (${email}) desde ${ip}`);
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    limpiarIntentos(ip); // ✅ si el password fue correcto

    // MFA / OTP
    if (!user.otp_secret) {
      const secret = speakeasy.generateSecret({
        name: `AuditoriaApp (${user.email})`,
      });

      connection.query(
        "UPDATE usuarios SET otp_secret = ? WHERE id_usuario = ?",
        [secret.base32, user.id_usuario]
      );

      QRCode.toDataURL(secret.otpauth_url, (err2, dataUrl) => {
        if (err2) return res.status(500).json({ error: "Error generando QR" });
        console.log(`📲 Se generó QR MFA para ${email}`);
        return res.json({
          id_usuario: user.id_usuario,
          qrImage: dataUrl,
          message: "Escanea este QR en tu app de autenticación.",
          requiresOtpSetup: true,
        });
      });
    } else {
      console.log(`✅ Usuario ${email} tiene OTP configurado, solicitando código.`);
      return res.json({
        id_usuario: user.id_usuario,
        message: "Ingrese el código de su autenticador",
        requiresOtpSetup: false,
      });
    }
  });
};

/* 🔑 Paso 2: Verificar OTP y emitir token JWT */
export const verificarOtp = (req, res) => {
  const { id_usuario, codigo } = req.body;

  const query = "SELECT * FROM usuarios WHERE id_usuario = ?";
  connection.query(query, [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (results.length === 0)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const user = results[0];
    if (!user.otp_secret)
      return res.status(400).json({ message: "El usuario no tiene OTP configurado." });

    const verified = speakeasy.totp.verify({
      secret: user.otp_secret,
      encoding: "base32",
      token: codigo,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ message: "Código incorrecto o expirado" });

    // OTP válido → generar JWT
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );
    
    console.log("TOKEN generado:", token);

    return res.json({
      message: "OTP verificado correctamente",
      token,
      usuario: user,
    });
  });
};

// ✅ Login con Google (simulado)
export const loginGoogle = (req, res) => {
  const { email, nombre } = req.body;
  const ip = req.ip;

  const query = "SELECT * FROM usuarios WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });

    if (results.length === 0) {
      const insert = "INSERT INTO usuarios (nombre, email, tipo_autenticacion, rol) VALUES (?, ?, 'google', 'visitante')";
      connection.query(insert, [nombre, email], (err2) => {
        if (err2) console.error("Error al crear usuario Google:", err2);
      });
    }

    registrarLog(email, "google", ip, true);
    const token = generarToken({ id_usuario: results[0]?.id_usuario || 0, email, rol: "visitante", tipo_autenticacion: "google" });
    res.json({ message: "Login con Google exitoso", token, email });
  });
};
