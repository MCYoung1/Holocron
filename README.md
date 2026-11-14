# Holocron

Holocron is a Star Wars quiz web app for browsing, creating, and playing fan-made quizzes. Users can register, author quizzes with multiple-choice or True/False questions, take quizzes, view their scores, and share public profile pages with quiz statistics.

## Stack

- **Frontend:** React 18, Vite, React Router 6, Bootstrap 5 with custom CSS theme
- **Backend:** Node.js 20, Express (ES modules), `pg`, bcryptjs, jsonwebtoken, dotenv, cors
- **Database:** PostgreSQL
- **Authentication:** JWT bearer tokens; the client persists the token and user in localStorage

## Data model

```text
+-------+       1       * +--------+       1       * +-----------+
| users |-----------------| quizzes|-----------------| questions |
+-------+                 +--------+                 +-----------+
    |                         |
    | 1                       | 1
    |                         |
    | 0..1                    | *
+----------+------------------+
| attempts |
+----------+
```

- A user owns quizzes; deleting a user cascades to their quizzes.
- A quiz contains questions and attempts; deleting a quiz cascades to both.
- An attempt may belong to the signed-in player. Anonymous attempts remain unlinked, and a user reference becomes `NULL` if the account is deleted.
- A user profile stores an optional avatar image and its MIME type in PostgreSQL.
- Each question is either multiple choice (four JSONB answer options) or True/False (exactly two options), with one correct option index.

The authoritative schema is [server/schema.sql](./server/schema.sql).

## API

All paths are relative to the API origin, defaulting to `http://localhost:3000`. Protected requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account; returns user and token |
| POST | `/auth/login` | Public | Authenticate; returns user and token |
| GET | `/quizzes` | Public | List quizzes with author and question count |
| GET | `/quizzes/:id` | Public | Get quiz details, author, and question count |
| GET | `/quizzes/:id/play` | Public | Get questions without correct answer indexes |
| POST | `/quizzes/:id/attempts` | Public; optional bearer token | Submit answers; a signed-in player's attempt is associated with their account; anonymous play remains supported. Returns attempt ID, score, percentage, rank, and per-question results. Omitted/skipped answers count as incorrect |
| GET | `/users/:username` | Public | Get a public profile and statistics: quizzes created, quizzes played, average score |
| GET | `/users/:username/avatar` | Public | Get the profile avatar image |
| PUT | `/me/avatar` | Authenticated | Upload or replace the current user's avatar (JPEG, PNG, GIF, or WebP; maximum 2 MB) |
| GET | `/me/quizzes` | Authenticated | List the signed-in user's quizzes |
| POST | `/quizzes` | Authenticated | Create a quiz |
| PUT | `/quizzes/:id` | Owner only | Partially update a quiz |
| DELETE | `/quizzes/:id` | Owner only | Delete a quiz and its questions |
| POST | `/quizzes/:id/questions` | Quiz owner | Add a question |
| PUT | `/questions/:id` | Parent quiz owner | Partially update a question |
| DELETE | `/questions/:id` | Parent quiz owner | Delete a question |

## User profiles

Every account has a public profile at `/users/:username` with its username, avatar, quizzes created, quizzes played, and average score. The counts and average are calculated from quizzes and recorded quiz attempts. The average is the mean percentage across the user's completed, non-empty attempts; quiz plays are attributed to an account when the player is signed in, while anonymous attempts remain anonymous. Signed-in users can upload a JPEG, PNG, GIF, or WebP avatar up to 2 MB from their own profile. Avatar bytes are stored in PostgreSQL.

## Styling

The client uses Bootstrap 5 for responsive layout, navigation, cards, buttons, and form controls. A small custom stylesheet layers Holocron's dark background, gold accent (`#ffe81f`), blue accent (`#4f9dff`), quiz answer states, and profile-avatar details over Bootstrap.

## Gameplay

Players can choose an option, move between questions with **Previous question** and **Next question**, or skip a question. At the review screen they can see which questions are answered or skipped and revisit any question before submitting. Answers and the current position are stored in browser `sessionStorage` per quiz, so a refresh in the same tab resumes the in-progress attempt. This is not a cross-tab, cross-device, or account-level save.

On submission, the server scores against the stored answer key, calculates a whole-number percentage (rounded to the nearest integer), assigns a rank, and saves the attempt in PostgreSQL. Skipped and unanswered questions count as incorrect. The results page displays score, percentage, and rank, with a link back to quiz details.

| Percentage | Rank |
|---:|---|
| 0–39% | Youngling |
| 40–59% | Padawan |
| 60–79% | Jedi Knight |
| 80–94% | Jedi Master |
| 95–100% | Lore Keeper |

## Local setup

Install Node.js 20 and PostgreSQL, including its command-line tools (`createdb` and `psql`). From PowerShell, create the database and apply its schema:

```powershell
createdb -U postgres holocron
Set-Location .\server
psql -U postgres -d holocron -f .\schema.sql
```

For an existing database, run the migrations from the repository root before starting the updated server:

```powershell
psql -U postgres -d holocron -f .\server\migrations\001_true_false_questions.sql
psql -U postgres -d holocron -f .\server\migrations\002_user_profiles.sql
```

The first migration adds True/False question support; the second adds PostgreSQL avatar storage for profiles. Existing questions default to multiple choice.

In `server`, copy `.env.example` to `.env` and set `DATABASE_URL` to match your local PostgreSQL username, password, host, and database. Set `JWT_SECRET` to a long, private random value. Keep this file local; do not commit it.

In `client/.env`, set the API URL to the local server's default port:

```env
VITE_API_URL=http://localhost:3000
```

Install dependencies and run the two development servers in separate PowerShell terminals:

```powershell
Set-Location C:\path\to\holocron\server
npm.cmd install
npm.cmd run dev
```

```powershell
Set-Location C:\path\to\holocron\client
npm.cmd install
npm.cmd run dev
```

Open the Vite URL (normally `http://localhost:5173`). Configure `CLIENT_ORIGIN=http://localhost:5173` in `server/.env` for local browser requests.

## Deployment plan

1. **Database — Neon:** Create a PostgreSQL database and use its connection string as the Render service's `DATABASE_URL`. Apply `server/schema.sql` to the Neon database with `psql` or the Neon SQL editor.
2. **API — Render:** Create a web service using `server` as its root directory, `npm install` as its build command, and `npm start` as its start command. Configure:
   - `DATABASE_URL`: Neon connection string (keep server-side; enable SSL as required by the provider).
   - `JWT_SECRET`: a strong, private production secret.
   - `CLIENT_ORIGIN`: exact deployed frontend origin, such as `https://your-site.netlify.app`.
   - `PORT`: use Render's assigned port if the platform does not set it automatically.
3. **Frontend — Netlify or Vercel:** Set `client` as the project root, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_API_URL` to the deployed Render API origin. This value is embedded in the public frontend build and must never contain a secret.
4. Configure the frontend host's SPA fallback so React Router paths resolve to `index.html`, and set the Render `CLIENT_ORIGIN` to the final deployed domain. Rebuild/redeploy the frontend after changing `VITE_API_URL`.

## Risks & mitigations

- **JWT secret exposure:** Keep `JWT_SECRET` only in the server's ignored `.env` locally and in the backend host's secret environment settings in production. Never put it in client files or a `VITE_*` variable. Rotate it if exposed; existing tokens will then need to be reissued.
- **Database credentials:** Keep `DATABASE_URL` server-side and out of source control. Use separate credentials for development and production, and restrict production database access to the backend where possible.
- **Public attempt endpoint:** Attempt submission is intentionally public and creates anonymous records. The server still calculates scores from stored answer keys; consider rate limiting and abuse monitoring before public launch.
- **Unfinished gameplay session:** Draft answers and the current question are stored in session storage for the current browser tab. They are not an account-synced or cross-device save; submitting the quiz ends that saved session.
- **Star Wars data dependency:** SWAPI integration is optional and is not required by the quiz flows. If added, its public endpoints are keyless; do not make app availability depend on it.

## How to contribute

Create a focused branch, make a small change that follows the existing React/Express and parameterized-SQL patterns, and update relevant documentation. Run `npm.cmd run build` from `client` and check the affected API routes before opening a pull request. Never include `.env` files, credentials, or generated `node_modules`/`dist` directories.

For end-user guidance, see [Instructions.md](./Instructions.md).

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).
