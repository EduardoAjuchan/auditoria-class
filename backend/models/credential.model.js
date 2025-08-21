function toCredential(row) {
  if (!row) return null;
  return {
    credId: row.cred_id,
    userId: row.user_id,
    method: row.method,     // 'BASIC' | 'HASH'
    password: row.password, // texto o hash
    createdAt: row.created_at,
  };
}
module.exports = { toCredential };
