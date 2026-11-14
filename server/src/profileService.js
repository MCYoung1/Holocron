import { pool } from './db.js';
import { isValidAvatar } from './avatarValidation.js';

export async function getPublicProfile(username) {
  const result = await pool.query(
    `SELECT users.id, users.username,
            users.avatar_data IS NOT NULL AS "hasAvatar",
            users.avatar_updated_at AS "avatarUpdatedAt",
            (SELECT COUNT(*)::int
             FROM quizzes
             WHERE quizzes.user_id = users.id) AS "quizzesCreated",
            (SELECT COUNT(*)::int
             FROM attempts
             WHERE attempts.user_id = users.id) AS "quizzesPlayed",
            COALESCE((
              SELECT ROUND(AVG(attempts.score::numeric * 100 / NULLIF(attempts.total, 0)), 1)
              FROM attempts
              WHERE attempts.user_id = users.id
                AND attempts.total > 0
            ), 0) AS "averageScore"
     FROM users
     WHERE users.username = $1`,
    [username],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return {
    ...result.rows[0],
    averageScore: Number(result.rows[0].averageScore),
  };
}

export async function getAvatar(username) {
  const result = await pool.query(
    `SELECT avatar_data AS data, avatar_mime_type AS "mimeType"
     FROM users
     WHERE username = $1 AND avatar_data IS NOT NULL`,
    [username],
  );
  return result.rows[0] ?? null;
}

export async function saveAvatar(userId, mimeType, data) {
  await pool.query(
    `UPDATE users
     SET avatar_data = $2, avatar_mime_type = $3, avatar_updated_at = NOW()
     WHERE id = $1`,
    [userId, data, mimeType],
  );
}
