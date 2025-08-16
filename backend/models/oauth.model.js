function toOAuth(row) {
  if (!row) return null;
  return {
    oauthId: row.oauth_id,
    userId: row.user_id,
    providerUserId: row.provider_user_id,
    email: row.email,
    createdAt: row.created_at,
  };
}
module.exports = { toOAuth };
