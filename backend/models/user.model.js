// Normaliza/selecciona campos del usuario
function toUser(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at,
  };
}
module.exports = { toUser };
