# Progress

## Phase 1 — Scaffold

- Created the client and server project structure, package manifests, environment template, and starter documentation.
- Added routed page stubs that render their names and a minimal dark-theme shell.
- Added a minimal API startup route.

## Phase 2 — Database and auth

- Added PostgreSQL tables for users, quizzes, questions, and attempts with the requested foreign-key deletion rules and correct-answer range check.
- Added a shared PostgreSQL pool, seven-day JWT signing, Bearer-token authentication middleware, and register/login endpoints.
- Added CORS configuration using `CLIENT_ORIGIN` and documented it in `.env.example`.

## Phase 3 — Public endpoints

- Added public quiz listing and detail endpoints with author names and question counts.
- Added a play endpoint that returns question IDs, text, options, and position without exposing correct answers.
- Added attempt submission that checks answers against database-stored correct indexes, calculates the score, and saves an anonymous attempt.

## Phase 4 — Owned routes

- Added authenticated quiz creation, listing of the current user's quizzes, partial update, and deletion.
- Added authenticated question creation, partial update, and deletion.
- Added ownership middleware for quizzes and questions; question ownership is verified through the parent quiz.
- Validated new question text, four options, and correct answer index; partial updates use SQL `COALESCE`.

## Phase 5 — Client bootstrap

- Wired React Router, the auth provider, and all seven stub pages into the client app.
- Added localStorage-backed auth state, a fetch helper for JSON API requests, error messages, and 204 responses.
- Added navigation, signed-in route guards, and responsive dark-theme styles with the requested gold and blue accents.
- Set the frontend API base URL to `http://localhost:4000` as requested. The current server `.env` uses port 3000, so align the server `PORT` before using API requests from the client.

## Phase 6 — Display pages

- Added the home hero and calls to action.
- Added quiz browsing with API loading/error states, title search, and linked quiz cards.
- Added quiz detail loading and not-found states with quiz metadata and a start link.
- Routed the requested `/quiz/:id/play` path to the play page while retaining the existing `/quizzes/:id/play` path.

## Phase 7 — Play and auth

- Added the quiz play flow: load questions, collect answers, submit the full answer map, and show the server-calculated score.
- Added loading, request error, and empty-quiz states, plus a link back to quiz details.
- Added login/register form toggle, API submission, auth-context persistence, and navigation to `/my` after success.

## Phase 8 — Authoring pages

- Added an authenticated My Quizzes page with question counts, view links, and confirmed deletion followed by a refreshed list.
- Added a quiz creation form with the requested category and difficulty choices, one initial question, four option inputs, correct-answer radio selection, and add/remove question controls.
- Quiz submission creates the quiz first, then each question, and navigates to its detail page; API errors are shown in an alert.
- Added `/quiz/:id` as a detail route for authoring and quiz-card navigation while preserving `/quizzes/:id`.

## Phase 9 — Finalize

- Rewrote the README with project description, stack, data model diagram, API reference, local setup, deployment plan, risks/mitigations, and contribution guidance.
- Added the MIT License and a client-specific `.gitignore`; root, server, and client ignore rules cover `node_modules/`, `.env`, and `dist/`.
- Aligned the client API URL with the server's default local port (`http://localhost:3000`).
- Final scan: no hardcoded credentials/secrets found in client or server source; SQL values are passed as pg parameters; protected user/owner routes have auth and ownership middleware. Public auth, quiz reads, and attempt submission are intentionally unauthenticated.

## Stage 10 — Complete gameplay flow (done)

- Added previous/next navigation, answer selection without automatic advancement, and skip navigation.
- Added a review screen that shows answered/skipped questions and allows returning to any question before submission.
- Saved per-quiz answers and current position in `sessionStorage` to resume after refresh in the same tab.
- Added final submission and score display; skipped and unanswered questions count as incorrect according to the existing server scorer.
- Updated the PRD and README to document session-scoped progress and gameplay behavior.

## Scoring and rankings (done)

- Added the server-side `RankService` to calculate the rounded percentage and assign Youngling, Padawan, Jedi Knight, Jedi Master, or Lore Keeper at the requested thresholds.
- Extended attempt submission to return the persisted attempt ID, score, percentage, rank, and question results. Attempts continue to be recorded in PostgreSQL; skipped answers count as incorrect.
- Updated the results page to show score, percentage, and rank.
- Added boundary and invalid-input tests for rank calculation, plus updated README, PRD, and user instructions.

## True/False questions (done)

- Added question types for four-option multiple choice and two-option True/False questions. Existing questions default to multiple choice.
- Added authoring controls to select a type and select exactly one correct answer; True/False options are fixed as **True** and **False**.
- Updated the play endpoint, gameplay answer validation, and quiz form submission to support two-option questions without revealing the answer key.
- Updated the clean-install schema and added `server/migrations/001_true_false_questions.sql` for existing databases. Apply that migration before starting the updated server.
- Added tests for valid/invalid True/False options and retained multiple-choice validation coverage. Updated README, PRD, and user instructions.

## Stage 11 — User profiles (done)

- Added public profiles showing username, avatar or a fallback, quizzes created, quizzes played, and average score.
- Added PostgreSQL avatar byte storage and an owner-only avatar upload endpoint, limited to 2 MB and validated as JPEG, PNG, GIF, or WebP by file signature.
- Linked profile pages from quiz author names and added a signed-in **My Profile** navigation link.
- Associated attempts with the signed-in player when a bearer token is supplied; anonymous quiz attempts remain supported. Profile statistics are calculated from owned quizzes and recorded attempts.
- Added a migration for existing databases at `server/migrations/002_user_profiles.sql`; apply it before starting the updated API. Updated README, PRD, and Instructions.
- Added avatar validation tests and verified server tests, server syntax, client build, migration, and profile/stat queries.
- Verify with `npm.cmd test` and `npm.cmd run build` from the `server` and `client` folders respectively.

## Stage 12 — Bootstrap 5 styling (done)

- Added Bootstrap 5 to the client and imported its stylesheet before the Holocron theme overrides.
- Restyled the application navigation and all pages with Bootstrap responsive layout, cards, buttons, alerts, and form controls.
- Preserved Holocron's dark theme, gold and blue accents, selected-answer state, and profile avatar styling in the custom stylesheet.
- Updated README, PRD, and user instructions to document the Bootstrap-based UI.
- Validation: `npm.cmd run build` from `client`.

## Local quiz account

- Username: `Skywalker`
- Email: `skywalker@example.test` (local testing only; this is not a real mailbox).
- A generated password was previously exposed in this project document and has been removed. Rotate the account password before using it beyond local testing; keep credentials in a private password manager or another untracked local secret store.
- Five category quizzes (Films, Characters, Planets, Vehicles, Lore) were created and verified with 10 questions each.

### Setup and test

1. In `server`, copy `.env.example` to `.env`; set `DATABASE_URL` to your PostgreSQL database and set `JWT_SECRET` to a private random value. Set `CLIENT_ORIGIN` to the Vite origin if needed.
2. In PowerShell, start PostgreSQL in Docker. Set a local development password containing only letters and numbers so it can be used directly in the connection URL:

   ```powershell
   $env:POSTGRES_PASSWORD = Read-Host "Choose a local PostgreSQL password"
   docker run --name holocron-db --restart unless-stopped -e POSTGRES_USER=holocron -e POSTGRES_DB=holocron -e POSTGRES_PASSWORD -p 5432:5432 -v holocron-postgres-data:/var/lib/postgresql/data -d postgres:16
   ```

   If `holocron-db` already exists, start it with `docker start holocron-db` instead. Set `DATABASE_URL` in `server/.env` to `postgresql://holocron:<your-password>@localhost:5432/holocron`.
3. From the `server` folder, copy and apply the schema using the PostgreSQL client inside the container (this does not require `psql` installed on Windows). This schema command is for a new/empty database:

   ```powershell
   docker cp .\schema.sql holocron-db:/tmp/schema.sql
   docker exec holocron-db psql -U holocron -d holocron -f /tmp/schema.sql
   ```

4. Run `npm.cmd run dev` from `server`.
5. In PowerShell, test registration:

   ```powershell
   $body = '{"username":"luke","email":"luke@example.com","password":"force-sensitive"}'
   Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/register -ContentType 'application/json' -Body $body
   ```

6. Test login (use the same email and password):

   ```powershell
   $body = '{"email":"luke@example.com","password":"force-sensitive"}'
   Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType 'application/json' -Body $body
   ```

   Both endpoints return a user object and JWT token. Registration returns HTTP 201; login returns HTTP 200.
7. Test the public quiz routes with curl. Replace `1` with an existing quiz ID, and for attempt submission replace question ID `1` with an ID returned by the play route. These routes return empty lists or 404 for individual quiz paths until quiz data exists.

   ```powershell
   curl.exe http://localhost:3000/quizzes
   ```

   ```powershell
   curl.exe http://localhost:3000/quizzes/1
   ```

   ```powershell
   curl.exe http://localhost:3000/quizzes/1/play
   ```

   ```powershell
   $body = '{"answers":{"1":0}}'
   curl.exe -X POST http://localhost:3000/quizzes/1/attempts -H "Content-Type: application/json" --data-raw $body
   ```

   Attempt results include each question's correct index so the client can show feedback after submission; the play response never includes it.

8. Test the owned-route flow in PowerShell. These commands create a uniquely named user, quiz, and question, list that user's quizzes, and delete the quiz. Deleting the quiz also deletes its questions.

   ```powershell
   $suffix = [guid]::NewGuid().ToString('N')
   $registerBody = @{ username = "student$suffix"; email = "student$suffix@example.com"; password = "force-sensitive" } | ConvertTo-Json -Compress
   $auth = curl.exe -sS -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" --data-raw $registerBody | ConvertFrom-Json
   $token = $auth.token
   $authHeader = "Authorization: Bearer $token"
   ```

   ```powershell
   $quizBody = @{ title = 'Outer Rim Trivia'; description = 'A sample quiz'; category = 'Star Wars'; difficulty = 'Easy' } | ConvertTo-Json -Compress
   $quiz = curl.exe -sS -X POST http://localhost:3000/quizzes -H $authHeader -H "Content-Type: application/json" --data-raw $quizBody | ConvertFrom-Json
   $quizId = $quiz.id
   ```

   ```powershell
   $questionBody = @{ text = 'Which planet is home to the Wookiees?'; options = @('Tatooine', 'Kashyyyk', 'Hoth', 'Naboo'); correctIndex = 1 } | ConvertTo-Json -Compress
   $question = curl.exe -sS -X POST "http://localhost:3000/quizzes/$quizId/questions" -H $authHeader -H "Content-Type: application/json" --data-raw $questionBody | ConvertFrom-Json
   ```

   ```powershell
   curl.exe -sS http://localhost:3000/me/quizzes -H $authHeader
   ```

   ```powershell
   curl.exe -i -X DELETE "http://localhost:3000/quizzes/$quizId" -H $authHeader
   ```

   A successful delete returns HTTP 204. Change the IDs and body values to test quiz/question updates or question deletion; update routes accept partial JSON fields.

9. To test the full client flow, run `npm.cmd run dev` in `client` and visit `http://localhost:5173`. Register at `/auth`; after successful registration the app navigates to `/my`. Choose `+ New quiz`, create a quiz with multiple-choice and/or True/False questions, and select each correct answer. Submit to view the quiz detail page, then choose `Start quiz`, answer each question, and view the score and rank. You can also use Browse to open the quiz, and delete it from My Quizzes afterward.

   The client `.env` points to the API's default port 3000. If you change the server `PORT`, also change `VITE_API_URL` and restart both development servers.

### Stage 10 gameplay test

1. Open a quiz that has questions and select **Start quiz**.
2. Select an answer, move Next, then Previous; confirm the selected answer remains recorded.
3. Skip a question and continue. Open the review screen to see answered/skipped status.
4. Refresh while playing; confirm the current question and answers resume in the same tab.
5. From review, revisit a question if desired, then submit. Confirm skipped questions count as incorrect and the score is displayed.
6. Progress is scoped to the current browser tab session; it is not synchronized to another tab or device.

### Next

All requested project phases are complete.
