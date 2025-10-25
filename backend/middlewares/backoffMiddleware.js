const intentosFallidos = new Map();

export function verificarBackoff(req, res, next) {
  const ip = req.ip;
  const intento = intentosFallidos.get(ip) || { intentos: 0, bloqueo: 0 };

  if (Date.now() < intento.bloqueo) {
    const tiempoRestante = Math.ceil((intento.bloqueo - Date.now()) / 1000);
    console.warn(`🚫 IP bloqueada (${ip}) — Espera ${tiempoRestante}s`);
    return res.status(429).json({
      message: `Demasiados intentos fallidos. Espera ${tiempoRestante} segundos.`,
    });
  }

  req.backoff = intento;
  next();
}

export function registrarIntentoFallido(ip) {
  const intento = intentosFallidos.get(ip) || { intentos: 0, bloqueo: 0 };
  intento.intentos++;

  // Calcular tiempo de espera exponencial
  if (intento.intentos >= 3) {
    const tiempoEspera = Math.min(60000, 5000 * 2 ** (intento.intentos - 3));
    intento.bloqueo = Date.now() + tiempoEspera;
    console.warn(`⚠️ Bloqueando IP ${ip} por ${tiempoEspera / 1000}s (intentos: ${intento.intentos})`);
  } else {
    console.log(`❌ Intento fallido #${intento.intentos} desde ${ip}`);
  }

  intentosFallidos.set(ip, intento);
}

export function limpiarIntentos(ip) {
  if (intentosFallidos.has(ip)) {
    console.log(`✅ Se limpió el contador de IP ${ip} tras login exitoso`);
  }
  intentosFallidos.delete(ip);
}
