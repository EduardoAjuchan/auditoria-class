const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const {
  getUserByUsername, getUserByEmail, createUser,
  getCredentialsByUserId, createBasicCredential, createHashCredential,
  getOAuthByProviderUserId, createOAuthAccount, insertLoginAudit
} = require('../data/auth.data');

const { JWT_SECRET, JWT_EXPIRES } = process.env;

// ===== Helpers =====
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES || '1h' });
}
function md5Hex(s) {
  return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}
function sha256Hex(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

// ===== BASIC (texto plano) =====
async function loginBasic(username, passwordPlain) {
  const user = await getUserByUsername(username);
  if (!user) {
    await insertLoginAudit({ method: 'BASIC', success: false });
    return { ok: false, error: 'Usuario o contraseña inválidos' };
  }
  const creds = await getCredentialsByUserId(user.user_id);
  const basic = creds.find(c => c.method === 'BASIC');
  if (!basic || basic.password !== passwordPlain) {
    await insertLoginAudit({ userId: user.user_id, method: 'BASIC', success: false });
    return { ok: false, error: 'Usuario o contraseña inválidos' };
  }
  const token = signToken({ uid: user.user_id, username: user.username });
  await insertLoginAudit({ userId: user.user_id, method: 'BASIC', success: true });
  return { ok: true, token };
}

// ===== HASH (MD5, SHA-256, bcrypt) =====
// NOTA: el esquema no guarda el algoritmo; probamos contra bcrypt, md5 y sha256.
async function loginHash(username, passwordPlain) {
  const user = await getUserByUsername(username);
  if (!user) {
    await insertLoginAudit({ method: 'HASH', success: false });
    return { ok: false, error: 'Usuario o contraseña inválidos' };
  }
  const creds = await getCredentialsByUserId(user.user_id);
  const list = creds.filter(c => c.method === 'HASH');

  let ok = false;
  for (const c of list) {
    // 1) bcrypt
    if (!ok && c.password.startsWith('$2')) {
      if (await bcrypt.compare(passwordPlain, c.password)) { ok = true; break; }
    }
    // 2) md5
    if (!ok && c.password.length === 32 && /^[a-f0-9]{32}$/i.test(c.password)) {
      if (md5Hex(passwordPlain) === c.password.toLowerCase()) { ok = true; break; }
    }
    // 3) sha256
    if (!ok && c.password.length === 64 && /^[a-f0-9]{64}$/i.test(c.password)) {
      if (sha256Hex(passwordPlain) === c.password.toLowerCase()) { ok = true; break; }
    }
  }

  if (!ok) {
    await insertLoginAudit({ userId: user.user_id, method: 'HASH', success: false });
    return { ok: false, error: 'Usuario o contraseña inválidos' };
  }

  const token = signToken({ uid: user.user_id, username: user.username });
  await insertLoginAudit({ userId: user.user_id, method: 'HASH', success: true });
  return { ok: true, token };
}

// ===== GOOGLE (ID Token) =====
async function loginGoogle(idToken) {
  // Verifica el ID Token con Google
  const client = new OAuth2Client(); // en front colocas audience; aquí usamos lib para verificar firma
  const ticket = await client.verifyIdToken({ idToken });
  const payload = ticket.getPayload(); // sub, email, picture, etc.

  const providerUserId = payload.sub;
  const email = payload.email;

  // ¿Existe cuenta OAuth?
  let oauth = await getOAuthByProviderUserId(providerUserId);
  let user;

  if (!oauth) {
    // ¿Existe usuario por email?
    user = await getUserByEmail(email);
    if (!user) {
      // Crea usuario anon con username basado en email (antes de @)
      const username = email.split('@')[0];
      user = await createUser({ username, email });
    }
    await createOAuthAccount(user.user_id, providerUserId, email);
  } else {
    // Cargar usuario dueño de esa cuenta
    user = await getUserByEmail(oauth.email);
    if (!user) {
      // fallback: si por algún motivo el email cambió/no existe, crea uno mínimo
      const username = email.split('@')[0];
      user = await createUser({ username, email });
    }
  }

  const token = signToken({ uid: user.user_id, username: user.username });
  await insertLoginAudit({ userId: user.user_id, method: 'GOOGLE', success: true });
  return { ok: true, token };
}

// ===== Helpers para alta de credenciales (útil en pruebas) =====
async function registerBasic(username, email, passwordPlain) {
  let user = await getUserByUsername(username);
  if (!user) user = await createUser({ username, email });
  await createBasicCredential(user.user_id, passwordPlain);
  return { ok: true, userId: user.user_id };
}
async function registerHash(username, email, passwordPlain, algo='bcrypt') {
  let user = await getUserByUsername(username);
  if (!user) user = await createUser({ username, email });

  let stored = '';
  if (algo === 'bcrypt') stored = await bcrypt.hash(passwordPlain, 10);
  else if (algo === 'md5') stored = md5Hex(passwordPlain);
  else if (algo === 'sha256') stored = sha256Hex(passwordPlain);
  else throw new Error('Algoritmo no soportado');

  await createHashCredential(user.user_id, stored);
  return { ok: true, userId: user.user_id };
}

module.exports = {
  loginBasic,
  loginHash,
  loginGoogle,
  registerBasic,
  registerHash,
};
