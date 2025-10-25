/**
 * simulador_trafico.js (ESM)
 *
 * Node.js script para simular tráfico de login (normal y anómalo).
 * Uso (PowerShell):
 *  node .\tools\simulador_trafico.js --ips "192.168.0.10,192.168.0.11" --mode mixed --duration 1 --target "http://localhost:3100/auth/loginSeguro" --dict ".\passwords.txt"
 *
 * Dependencias: axios, minimist
 * npm install axios minimist
 */

import axios from "axios";
import fs from "fs";
import path from "path";
import minimist from "minimist";

// -------------------- Helpers para CLI --------------------
const argv = minimist(process.argv.slice(2), {
  string: ["ips", "mode", "target", "dict", "validCreds"],
  default: {
    ips: "127.0.0.1",
    mode: "mixed", // normal | anomalo | mixed
    duration: 2, // minutos
    target: "http://localhost:3100/auth/loginSeguro",
    dict: "",
    validCreds: "", // archivo JSON [{email, password}, ...]
    normalMin: 1,
    normalMax: 9,
    anomaloMin: 10,
    anomaloMax: 150,
    invalidRatio: 0.9, // probabilidad de que el intento sea inválido
  },
});

function parseCSVList(s) {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

// -------------------- Config --------------------
const IPS = parseCSVList(argv.ips);
const MODE = argv.mode; // normal | anomalo | mixed
const DURATION_MIN = Number(argv.duration);
const TARGET_URL = argv.target;
const DICT_FILE = argv.dict ? path.resolve(argv.dict) : null;
const VALID_CREDS_FILE = argv.validCreds ? path.resolve(argv.validCreds) : null;

const NORMAL_MIN = Number(argv.normalMin);
const NORMAL_MAX = Number(argv.normalMax);
const ANOMALO_MIN = Number(argv.anomaloMin);
const ANOMALO_MAX = Number(argv.anomaloMax);
const INVALID_RATIO = Number(argv.invalidRatio);

if (!Array.isArray(IPS) || IPS.length === 0) {
  console.error("No se especificaron IPs. Usa --ips ip1,ip2,...");
  process.exit(1);
}

// -------------------- Cargar diccionario y credenciales válidas --------------------
let dictPasswords = [];
if (DICT_FILE && fs.existsSync(DICT_FILE)) {
  dictPasswords = fs.readFileSync(DICT_FILE, "utf-8")
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
  console.log(`📚 Diccionario cargado: ${dictPasswords.length} contraseñas`);
}

let validCreds = [];
if (VALID_CREDS_FILE && fs.existsSync(VALID_CREDS_FILE)) {
  try {
    const raw = fs.readFileSync(VALID_CREDS_FILE, "utf-8");
    validCreds = JSON.parse(raw);
    if (!Array.isArray(validCreds)) {
      console.warn("⚠️ validCreds no es un array. Ignorando.");
      validCreds = [];
    } else {
      console.log(`✅ Credenciales válidas cargadas: ${validCreds.length}`);
    }
  } catch (err) {
    console.warn("⚠️ Error leyendo validCreds:", err.message);
    validCreds = [];
  }
}

// -------------------- User agents simples --------------------
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "curl/7.81.0",
  "python-requests/2.31.0"
];

// -------------------- Utilidades --------------------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Formatea un email falso
function fakeEmail(ip, i) {
  const base = ip.replace(/\./g, "-");
  return `victim+${base}.${i}@demo.com`;
}

// -------------------- Lógica de simulación por IP --------------------
async function simulateIP(ip, profile) {
  const { modeForIP, durationMin, dict, validCreds, invalidRatio } = profile;
  const endTime = Date.now() + durationMin * 60 * 1000;
  console.log(`▶️ Iniciando simulación para ${ip} (modo: ${modeForIP}) durante ${durationMin} min`);

  let attemptCounter = 0;
  let seq = 0;

  while (Date.now() < endTime) {
    // decidir rate por minuto según modo
    let ratePerMin;
    if (modeForIP === "normal") {
      ratePerMin = randInt(NORMAL_MIN, NORMAL_MAX);
    } else if (modeForIP === "anomalo") {
      ratePerMin = randInt(ANOMALO_MIN, ANOMALO_MAX);
    } else { // mixed -> 50% prob normal/anomalo each minute
      if (Math.random() < 0.5) ratePerMin = randInt(NORMAL_MIN, NORMAL_MAX);
      else ratePerMin = randInt(ANOMALO_MIN, ANOMALO_MAX);
    }

    // distribuir ratePerMin en intervallos aleatorios a lo largo del minuto
    const attemptsThisMinute = ratePerMin;
    for (let i = 0; i < attemptsThisMinute; i++) {
      seq++;
      attemptCounter++;

      // decidir si intento válido o inválido
      const isInvalid = Math.random() < invalidRatio; // probabilidad de ser inválido
      let email, password;

      if (!isInvalid && validCreds.length > 0) {
        // credencial válida aleatoria
        const cred = randChoice(validCreds);
        email = cred.email;
        password = cred.password;
      } else {
        // email aleatorio / password del diccionario si existe
        email = fakeEmail(ip, seq);
        if (dict && dict.length > 0 && Math.random() < 0.9) {
          password = randChoice(dict);
        } else {
          // generar password aleatorio corto
          password = `p${randInt(1000,999999)}`;
        }
      }

      // headers para simular IP y UA
      const headers = {
        "User-Agent": randChoice(USER_AGENTS),
        "X-Forwarded-For": ip,
        "X-Simulator": "simulador_trafico"
      };

      // POST body (ajustable según endpoint)
      const body = { email, password };

      // Hacer el request sin bloquear (pero limitando concurrencia con await si hace falta)
      axios.post(TARGET_URL, body, { headers, timeout: 5000 })
        .then(res => {
          console.log(`[${ip}] ✅ ${res.status} - ${email} (${isInvalid ? "INV" : "OK"})`);
        })
        .catch(err => {
          if (err.response) {
            // respuesta del servidor (p. ej. 401)
            console.log(`[${ip}] ✖ ${err.response.status} - ${email} (${isInvalid ? "INV" : "OK"})`);
          } else {
            console.log(`[${ip}] ⚠️ Error request - ${err.message}`);
          }
        });

      // esperar un tiempo dentro del minuto: distribuir uniformemente, con algo de jitter
      const avgIntervalMs = (60 * 1000) / Math.max(attemptsThisMinute, 1);
      const jitter = Math.random() * avgIntervalMs * 0.6; // hasta 60% de jitter
      const waitMs = Math.max(50, Math.floor(avgIntervalMs + (Math.random() - 0.5) * jitter));
      await sleep(waitMs);
      if (Date.now() >= endTime) break;
    }

    // al terminar la "ventana" de 1 minuto, continuar al siguiente
  }

  console.log(`⏹️ Simulación finalizada para ${ip}. Intentos totales: ${attemptCounter}`);
}

// -------------------- Ejecutar simulación para todas las IPs --------------------
async function main() {
  const tasks = [];

  for (const ip of IPS) {
    let modeForIP = MODE;
    if (MODE === "mixed") {
      modeForIP = Math.random() < 0.5 ? "normal" : "anomalo";
    }

    const profile = {
      modeForIP,
      durationMin: DURATION_MIN,
      dict: dictPasswords,
      validCreds,
      invalidRatio: INVALID_RATIO
    };

    tasks.push(simulateIP(ip, profile));
    // pequeño offset entre IPs para no iniciar todo exacto al mismo ms
    await sleep(200);
  }

  // ejecutar todas las simulaciones en paralelo (espera que terminen)
  await Promise.all(tasks);
  console.log("✅ Todas las simulaciones finalizaron.");
}

// Ejecutar
main().catch(err => {
  console.error("Error en simulador:", err);
  process.exit(1);
});
