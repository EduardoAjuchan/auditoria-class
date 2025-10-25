export function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const { usuario } = req;
    if (!usuario) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ message: "Acceso denegado. Rol insuficiente." });
    }

    next();
  };
}
