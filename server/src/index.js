import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { optionalAuth, requireAuth, sign } from './auth.js';
import { isValidAvatar } from './avatarValidation.js';
import { pool } from './db.js';
import { getAvatar, getPublicProfile, saveAvatar } from './profileService.js';
import { isValidQuestion } from './questionService.js';
import { RankService } from './rankService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.post('/auth/register', async (request, response) => {
  const { username, email, password } = request.body ?? {};

  if (
    typeof username !== 'string' || !username.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password
  ) {
    return response.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [normalizedUsername, normalizedEmail, passwordHash],
    );
    const user = result.rows[0];

    return response.status(201).json({ user, token: sign(user) });
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({ error: 'Username or email is already in use.' });
    }

    console.error('Registration failed:', error);
    return response.status(500).json({ error: 'Unable to register user.' });
  }
});

app.post('/auth/login', async (request, response) => {
  const { email, password } = request.body ?? {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return response.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()],
    );
    const row = result.rows[0];

    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return response.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: row.id, username: row.username, email: row.email };
    return response.json({ user, token: sign(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return response.status(500).json({ error: 'Unable to log in.' });
  }
});

app.get('/users/:username', async (request, response) => {
  try {
    const profile = await getPublicProfile(request.params.username);
    if (!profile) {
      return response.status(404).json({ error: 'User profile not found.' });
    }
    return response.json(profile);
  } catch (error) {
    console.error('Loading public user profile failed:', error);
    return response.status(500).json({ error: 'Unable to load user profile.' });
  }
});

app.get('/users/:username/avatar', async (request, response) => {
  try {
    const avatar = await getAvatar(request.params.username);
    if (!avatar) {
      return response.status(404).json({ error: 'User avatar not found.' });
    }
    response.set('Content-Type', avatar.mimeType);
    response.set('Cache-Control', 'public, max-age=3600');
    response.set('X-Content-Type-Options', 'nosniff');
    return response.send(avatar.data);
  } catch (error) {
    console.error('Loading user avatar failed:', error);
    return response.status(500).json({ error: 'Unable to load user avatar.' });
  }
});

app.put(
  '/me/avatar',
  requireAuth,
  express.raw({ type: 'application/octet-stream', limit: '2mb' }),
  async (request, response) => {
    const mimeType = request.get('x-avatar-content-type') || '';
    if (!isValidAvatar(mimeType, request.body)) {
      return response.status(400).json({
        error: 'Upload a valid JPEG, PNG, GIF, or WebP image no larger than 2 MB.',
      });
    }

    try {
      await saveAvatar(request.user.id, mimeType, request.body);
      return response.status(204).end();
    } catch (error) {
      console.error('Saving user avatar failed:', error);
      return response.status(500).json({ error: 'Unable to save user avatar.' });
    }
  },
);

function parseQuizId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validText(value, allowEmpty = false) {
  return typeof value === 'string' && (allowEmpty || value.trim().length > 0);
}

async function ownQuiz(request, response, next) {
  const quizId = parseQuizId(request.params.id);
  if (!quizId) {
    return response.status(400).json({ error: 'Quiz ID must be a positive integer.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, user_id FROM quizzes WHERE id = $1',
      [quizId],
    );
    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Quiz not found.' });
    }
    if (String(result.rows[0].user_id) !== String(request.user.id)) {
      return response.status(403).json({ error: 'You do not own this quiz.' });
    }

    request.quiz = result.rows[0];
    return next();
  } catch (error) {
    console.error('Checking quiz ownership failed:', error);
    return response.status(500).json({ error: 'Unable to verify quiz ownership.' });
  }
}

async function ownQuestion(request, response, next) {
  const questionId = parseQuizId(request.params.id);
  if (!questionId) {
    return response.status(400).json({ error: 'Question ID must be a positive integer.' });
  }

  try {
    // Resolve ownership through the parent quiz because questions have no owner column.
    const result = await pool.query(
      `SELECT questions.id, questions.quiz_id, quizzes.user_id
       FROM questions
       JOIN quizzes ON quizzes.id = questions.quiz_id
       WHERE questions.id = $1`,
      [questionId],
    );
    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Question not found.' });
    }
    if (String(result.rows[0].user_id) !== String(request.user.id)) {
      return response.status(403).json({ error: 'You do not own the quiz for this question.' });
    }

    request.question = result.rows[0];
    return next();
  } catch (error) {
    console.error('Checking question ownership failed:', error);
    return response.status(500).json({ error: 'Unable to verify question ownership.' });
  }
}

app.get('/quizzes', async (_request, response) => {
  try {
    const result = await pool.query(
      `SELECT quizzes.id, quizzes.user_id, quizzes.title, quizzes.description,
              quizzes.category, quizzes.difficulty, quizzes.created_at,
              users.username AS author, COUNT(questions.id)::int AS question_count
       FROM quizzes
       JOIN users ON users.id = quizzes.user_id
       LEFT JOIN questions ON questions.quiz_id = quizzes.id
       GROUP BY quizzes.id, users.username
       ORDER BY quizzes.created_at DESC`,
    );
    return response.json(result.rows);
  } catch (error) {
    console.error('Listing quizzes failed:', error);
    return response.status(500).json({ error: 'Unable to list quizzes.' });
  }
});

app.get('/quizzes/:id', async (request, response) => {
  const quizId = parseQuizId(request.params.id);
  if (!quizId) {
    return response.status(400).json({ error: 'Quiz ID must be a positive integer.' });
  }

  try {
    const result = await pool.query(
      `SELECT quizzes.id, quizzes.user_id, quizzes.title, quizzes.description,
              quizzes.category, quizzes.difficulty, quizzes.created_at,
              users.username AS author, COUNT(questions.id)::int AS question_count
       FROM quizzes
       JOIN users ON users.id = quizzes.user_id
       LEFT JOIN questions ON questions.quiz_id = quizzes.id
       WHERE quizzes.id = $1
       GROUP BY quizzes.id, users.username`,
      [quizId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Quiz not found.' });
    }

    return response.json(result.rows[0]);
  } catch (error) {
    console.error('Loading quiz failed:', error);
    return response.status(500).json({ error: 'Unable to load quiz.' });
  }
});

app.get('/quizzes/:id/play', async (request, response) => {
  const quizId = parseQuizId(request.params.id);
  if (!quizId) {
    return response.status(400).json({ error: 'Quiz ID must be a positive integer.' });
  }

  try {
    const quiz = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1',
      [quizId],
    );
    if (quiz.rowCount === 0) {
      return response.status(404).json({ error: 'Quiz not found.' });
    }

    // Keep correct_index out of the play response so answers cannot be read before submission.
    const questions = await pool.query(
      `SELECT id, text, question_type AS "questionType", options, position
       FROM questions
       WHERE quiz_id = $1
       ORDER BY position ASC`,
      [quizId],
    );
    return response.json(questions.rows);
  } catch (error) {
    console.error('Loading quiz questions failed:', error);
    return response.status(500).json({ error: 'Unable to load quiz questions.' });
  }
});

app.post('/quizzes/:id/attempts', optionalAuth, async (request, response) => {
  const quizId = parseQuizId(request.params.id);
  if (!quizId) {
    return response.status(400).json({ error: 'Quiz ID must be a positive integer.' });
  }

  const { answers } = request.body ?? {};
  if (
    answers === null ||
    typeof answers !== 'object' ||
    Array.isArray(answers) ||
    Object.entries(answers).some(([questionId, index]) =>
      !/^[1-9]\d*$/.test(questionId) ||
      !Number.isSafeInteger(Number(questionId)) ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 3
    )
  ) {
    return response.status(400).json({
      error: 'Answers must map positive question IDs to option indexes from 0 to 3.',
    });
  }

  try {
    const quiz = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1',
      [quizId],
    );
    if (quiz.rowCount === 0) {
      return response.status(404).json({ error: 'Quiz not found.' });
    }

    // Score only against the answer key stored in the database, never a client-supplied key.
    const questionResult = await pool.query(
      `SELECT id, correct_index, jsonb_array_length(options) AS option_count
       FROM questions
       WHERE quiz_id = $1
       ORDER BY position ASC`,
      [quizId],
    );
    if (questionResult.rows.some((question) => {
      const answer = answers[String(question.id)];
      return answer !== undefined && answer >= question.option_count;
    })) {
      return response.status(400).json({
        error: 'An answer index is outside the available options for its question.',
      });
    }

    const results = questionResult.rows.map((question) => ({
      questionId: question.id,
      correct: answers[String(question.id)] === question.correct_index,
      correctIndex: question.correct_index,
    }));
    const score = results.filter((result) => result.correct).length;
    const total = results.length;
    const { percentage, rank } = RankService.calculate(score, total);

    const attempt = await pool.query(
      `INSERT INTO attempts (quiz_id, user_id, score, total)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [quizId, request.user?.id ?? null, score, total],
    );

    return response.status(201).json({
      attemptId: attempt.rows[0].id,
      score,
      total,
      percentage,
      rank,
      results,
    });
  } catch (error) {
    console.error('Recording quiz attempt failed:', error);
    return response.status(500).json({ error: 'Unable to record quiz attempt.' });
  }
});

app.get('/me/quizzes', requireAuth, async (request, response) => {
  try {
    const result = await pool.query(
      `SELECT quizzes.id, quizzes.user_id, quizzes.title, quizzes.description,
              quizzes.category, quizzes.difficulty, quizzes.created_at,
              COUNT(questions.id)::int AS question_count
       FROM quizzes
       LEFT JOIN questions ON questions.quiz_id = quizzes.id
       WHERE quizzes.user_id = $1
       GROUP BY quizzes.id
       ORDER BY quizzes.created_at DESC`,
      [request.user.id],
    );
    return response.json(result.rows);
  } catch (error) {
    console.error('Listing owned quizzes failed:', error);
    return response.status(500).json({ error: 'Unable to list your quizzes.' });
  }
});

app.post('/quizzes', requireAuth, async (request, response) => {
  const { title, description = '', category, difficulty } = request.body ?? {};
  if (
    !validText(title) ||
    !validText(description, true) ||
    !validText(category) ||
    !validText(difficulty)
  ) {
    return response.status(400).json({
      error: 'Title, description, category, and difficulty must be valid text.',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO quizzes (user_id, title, description, category, difficulty)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, description, category, difficulty, created_at`,
      [request.user.id, title.trim(), description, category.trim(), difficulty.trim()],
    );
    return response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Creating quiz failed:', error);
    return response.status(500).json({ error: 'Unable to create quiz.' });
  }
});

app.put('/quizzes/:id', requireAuth, ownQuiz, async (request, response) => {
  const { title, description, category, difficulty } = request.body ?? {};
  if (
    (title !== undefined && title !== null && !validText(title)) ||
    (description !== undefined && description !== null && !validText(description, true)) ||
    (category !== undefined && category !== null && !validText(category)) ||
    (difficulty !== undefined && difficulty !== null && !validText(difficulty))
  ) {
    return response.status(400).json({ error: 'Quiz fields must be valid text.' });
  }

  try {
    const result = await pool.query(
      `UPDATE quizzes
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           difficulty = COALESCE($5, difficulty)
       WHERE id = $1
       RETURNING id, user_id, title, description, category, difficulty, created_at`,
      [
        request.quiz.id,
        title === undefined || title === null ? null : title.trim(),
        description === undefined || description === null ? null : description,
        category === undefined || category === null ? null : category.trim(),
        difficulty === undefined || difficulty === null ? null : difficulty.trim(),
      ],
    );
    return response.json(result.rows[0]);
  } catch (error) {
    console.error('Updating quiz failed:', error);
    return response.status(500).json({ error: 'Unable to update quiz.' });
  }
});

app.delete('/quizzes/:id', requireAuth, ownQuiz, async (request, response) => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id = $1', [request.quiz.id]);
    return response.status(204).end();
  } catch (error) {
    console.error('Deleting quiz failed:', error);
    return response.status(500).json({ error: 'Unable to delete quiz.' });
  }
});

app.post('/quizzes/:id/questions', requireAuth, ownQuiz, async (request, response) => {
  const {
    text,
    questionType = 'multiple_choice',
    options,
    correctIndex,
  } = request.body ?? {};
  if (
    !validText(text) ||
    !isValidQuestion(questionType, options, correctIndex)
  ) {
    return response.status(400).json({
      error: 'Question text, a valid question type, the required non-empty options, and a valid correctIndex are required.',
    });
  }

  try {
    // Assign each new question the next position within its quiz.
    const result = await pool.query(
      `INSERT INTO questions (quiz_id, text, question_type, options, correct_index, position)
       VALUES (
         $1, $2, $3, $4::jsonb, $5,
         COALESCE((SELECT MAX(position) FROM questions WHERE quiz_id = $1), 0) + 1
       )
       RETURNING id, quiz_id, text, question_type AS "questionType", options,
                 correct_index AS "correctIndex", position`,
      [request.quiz.id, text.trim(), questionType, JSON.stringify(options), correctIndex],
    );
    return response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding quiz question failed:', error);
    return response.status(500).json({ error: 'Unable to add question.' });
  }
});

app.put('/questions/:id', requireAuth, ownQuestion, async (request, response) => {
  const { text, questionType, options, correctIndex } = request.body ?? {};
  if (
    (text !== undefined && text !== null && !validText(text)) ||
    (questionType !== undefined && questionType !== null &&
      !['multiple_choice', 'true_false'].includes(questionType))
  ) {
    return response.status(400).json({ error: 'Question fields are invalid.' });
  }

  try {
    const currentQuestion = await pool.query(
      'SELECT question_type, options, correct_index FROM questions WHERE id = $1',
      [request.question.id],
    );
    const updatedType = questionType ?? currentQuestion.rows[0].question_type;
    const updatedOptions = options ?? currentQuestion.rows[0].options;
    const updatedCorrectIndex = correctIndex ?? currentQuestion.rows[0].correct_index;
    if (!isValidQuestion(updatedType, updatedOptions, updatedCorrectIndex)) {
      return response.status(400).json({ error: 'Question fields are invalid for the selected question type.' });
    }

    const result = await pool.query(
      `UPDATE questions
       SET text = COALESCE($2, text),
           question_type = $3,
           options = $4::jsonb,
           correct_index = $5
       WHERE id = $1
       RETURNING id, quiz_id, text, question_type AS "questionType", options,
                 correct_index AS "correctIndex", position`,
      [
        request.question.id,
        text === undefined || text === null ? null : text.trim(),
        updatedType,
        JSON.stringify(updatedOptions),
        updatedCorrectIndex,
      ],
    );
    return response.json(result.rows[0]);
  } catch (error) {
    console.error('Updating quiz question failed:', error);
    return response.status(500).json({ error: 'Unable to update question.' });
  }
});

app.delete('/questions/:id', requireAuth, ownQuestion, async (request, response) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [request.question.id]);
    return response.status(204).end();
  } catch (error) {
    console.error('Deleting quiz question failed:', error);
    return response.status(500).json({ error: 'Unable to delete question.' });
  }
});

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Avatar image must be no larger than 2 MB.' });
  }
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body is invalid.' });
  }

  console.error('Unhandled API request error:', error);
  return response.status(500).json({ error: 'Unable to process the request.' });
});

app.listen(port, () => {
  console.log(`Holocron API listening on port ${port}`);
});
