BEGIN;

ALTER TABLE questions
  ADD COLUMN question_type TEXT NOT NULL DEFAULT 'multiple_choice';

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_correct_index_check,
  DROP CONSTRAINT IF EXISTS questions_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_question_type_check
    CHECK (question_type IN ('multiple_choice', 'true_false')),
  ADD CONSTRAINT questions_options_check
    CHECK (
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
  ADD CONSTRAINT questions_correct_index_check
    CHECK (
      CASE
        WHEN jsonb_typeof(options) = 'array' THEN
          correct_index >= 0 AND correct_index < jsonb_array_length(options)
        ELSE FALSE
      END
    );

COMMIT;
