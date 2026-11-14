BEGIN;

ALTER TABLE users
  ADD COLUMN avatar_data BYTEA,
  ADD COLUMN avatar_mime_type TEXT,
  ADD COLUMN avatar_updated_at TIMESTAMPTZ,
  ADD CONSTRAINT users_avatar_fields_check CHECK (
    (avatar_data IS NULL AND avatar_mime_type IS NULL AND avatar_updated_at IS NULL)
    OR (
      avatar_data IS NOT NULL
      AND avatar_mime_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp')
      AND avatar_updated_at IS NOT NULL
    )
  );

COMMIT;
