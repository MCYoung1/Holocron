CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_data BYTEA,
  avatar_mime_type TEXT,
  avatar_updated_at TIMESTAMPTZ,
  CHECK (
    (avatar_data IS NULL AND avatar_mime_type IS NULL AND avatar_updated_at IS NULL)
    OR (
      avatar_data IS NOT NULL
      AND avatar_mime_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp')
      AND avatar_updated_at IS NOT NULL
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quizzes (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  position INTEGER NOT NULL,
  CONSTRAINT questions_question_type_check
    CHECK (question_type IN ('multiple_choice', 'true_false')),
  CONSTRAINT questions_options_check CHECK (
    CASE
      WHEN jsonb_typeof(options) = 'array' THEN
        (
          (question_type = 'multiple_choice' AND jsonb_array_length(options) = 4)
          OR (question_type = 'true_false' AND jsonb_array_length(options) = 2)
        )
        AND jsonb_typeof(options -> 0) = 'string'
        AND jsonb_typeof(options -> 1) = 'string'
        AND (
          question_type = 'true_false'
          OR (
            jsonb_typeof(options -> 2) = 'string'
            AND jsonb_typeof(options -> 3) = 'string'
          )
        )
      ELSE FALSE
    END
  ),
  CONSTRAINT questions_correct_index_check CHECK (
    CASE
      WHEN jsonb_typeof(options) = 'array' THEN
        correct_index >= 0 AND correct_index < jsonb_array_length(options)
      ELSE FALSE
    END
  )
);

CREATE TABLE attempts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Preserve anonymous attempts if the account is deleted.
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
