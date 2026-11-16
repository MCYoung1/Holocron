import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from './db.js';

async function hasColumn(tableName, columnName) {
  const result = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = $1
       AND column_name = $2`,
    [tableName, columnName],
  );
  return result.rowCount > 0;
}

async function hasConstraint(tableName, constraintName) {
  const result = await pool.query(
    `SELECT 1
     FROM pg_constraint
     WHERE conrelid = to_regclass($1)
       AND conname = $2`,
    [tableName, constraintName],
  );
  return result.rowCount > 0;
}

async function applyMigration(fileName) {
  const migration = await readFile(new URL(`../migrations/${fileName}`, import.meta.url), 'utf8');
  await pool.query(migration);
  console.log(`Applied ${fileName}.`);
}

try {
  const questionTypeExists = await hasColumn('questions', 'question_type');
  if (!questionTypeExists) {
    await applyMigration('001_true_false_questions.sql');
  } else {
    const constraints = await Promise.all([
      hasConstraint('questions', 'questions_question_type_check'),
      hasConstraint('questions', 'questions_options_check'),
      hasConstraint('questions', 'questions_correct_index_check'),
    ]);
    if (constraints.some((exists) => !exists)) {
      throw new Error('True/False schema is partially applied. Inspect the questions table before continuing.');
    }
    console.log('Skipped 001_true_false_questions.sql; schema is already present.');
  }

  const avatarColumns = await Promise.all([
    hasColumn('users', 'avatar_data'),
    hasColumn('users', 'avatar_mime_type'),
    hasColumn('users', 'avatar_updated_at'),
  ]);
  if (avatarColumns.every((exists) => !exists)) {
    await applyMigration('002_user_profiles.sql');
  } else if (avatarColumns.every(Boolean) &&
    await hasConstraint('users', 'users_avatar_fields_check')) {
    console.log('Skipped 002_user_profiles.sql; schema is already present.');
  } else {
    throw new Error('User profile schema is partially applied. Inspect the users table before continuing.');
  }
} catch (error) {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
