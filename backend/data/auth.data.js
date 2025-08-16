const { pool } = require('../config/db');

// USERS
async function getUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}
async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}
async function createUser({ username, email }) {
  const [r] = await pool.query('INSERT INTO users (username, email) VALUES (?,?)', [username, email]);
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [r.insertId]);
  return rows[0] || null;
}

// CREDENTIALS
async function getCredentialsByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM auth_credentials WHERE user_id = ?', [userId]);
  return rows;
}
async function createBasicCredential(userId, passwordPlain) {
  const [r] = await pool.query(
    'INSERT INTO auth_credentials (user_id, method, password) VALUES (?,?,?)',
    [userId, 'BASIC', passwordPlain]
  );
  return r.insertId;
}
async function createHashCredential(userId, passwordHash) {
  const [r] = await pool.query(
    'INSERT INTO auth_credentials (user_id, method, password) VALUES (?,?,?)',
    [userId, 'HASH', passwordHash]
  );
  return r.insertId;
}

// OAUTH (GOOGLE)
async function getOAuthByProviderUserId(providerUserId) {
  const [rows] = await pool.query(
    'SELECT * FROM oauth_account WHERE provider_user_id = ?',
    [providerUserId]
  );
  return rows[0] || null;
}
async function createOAuthAccount(userId, providerUserId, email) {
  const [r] = await pool.query(
    'INSERT INTO oauth_account (user_id, provider_user_id, email) VALUES (?,?,?)',
    [userId, providerUserId, email]
  );
  return r.insertId;
}

// AUDIT
async function insertLoginAudit({ userId = null, method, success }) {
  await pool.query(
    'INSERT INTO login_audit (user_id, method, success) VALUES (?,?,?)',
    [userId, method, success ? 1 : 0]
  );
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  createUser,
  getCredentialsByUserId,
  createBasicCredential,
  createHashCredential,
  getOAuthByProviderUserId,
  createOAuthAccount,
  insertLoginAudit,
};
