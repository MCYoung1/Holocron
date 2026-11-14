# Product Requirements

Holocron is a web app where users can browse, create, and play Star Wars quizzes.

## Planned capabilities

- Register and sign in with email and password.
- Browse quizzes with author, category, difficulty, and question count.
- Create, edit, and delete quizzes and their questions.
- Play quizzes, navigate between questions, skip questions, and view scored attempts.
- View public user profiles with uploaded avatars and quiz activity statistics.
- Upload or replace an avatar on the signed-in user's own profile.

## Gameplay requirements

- Load quiz questions without revealing their correct answer indexes.
- Support multiple-choice questions with four answers and True/False questions with exactly two answers and one correct answer.
- Let players select an answer, move to the next or previous question, and skip without selecting an answer.
- Track the current question and selected answers in browser session storage so a refresh in the same tab can resume the quiz.
- Provide a review step showing which questions are answered or skipped and let players return to any question before submitting.
- Submit the answer map to the server for scoring. Skipped and unanswered questions count as incorrect.
- Calculate a whole-number percentage rounded to the nearest integer and assign the corresponding rank: 0–39% Youngling, 40–59% Padawan, 60–79% Jedi Knight, 80–94% Jedi Master, and 95–100% Lore Keeper.
- Persist every completed attempt in PostgreSQL and return its ID, score, percentage, rank, and per-question results.
- Show score, percentage, and rank on the completed-results page, with a link back to the quiz.
- Handle quizzes with no questions and API errors with clear messages.
- Allow quiz authors to select a question type. True/False questions always use the fixed **True** and **False** choices, with one selected as correct.

## User profile requirements

- Provide a public profile route identified by username that displays the username, avatar (or a default fallback), quizzes created, quizzes played, and average score.
- Calculate quizzes created from quizzes owned by the user. Calculate quizzes played as the number of completed attempts attributed to the user; calculate average score as the mean percentage across their completed attempts with at least one question.
- Store optional avatar image bytes and MIME type in PostgreSQL. Only the authenticated account owner may upload or replace their avatar.
- Accept JPEG, PNG, GIF, or WebP uploads up to 2 MB; validate the file signature and do not accept SVG.
- Keep quiz play public. When an authenticated player submits an attempt, associate that attempt with their account; leave anonymous attempts unassociated.
- Make public profile pages discoverable from quiz author names and the signed-in user's navigation.

## Technology

- Frontend: React 18, Vite, React Router 6, Bootstrap 5, and a small custom CSS theme.
- Backend: Node.js 20, Express, and PostgreSQL.
- Authentication: JWT bearer tokens stored with the user session in local storage.

## Interface and styling

- Use Bootstrap 5 responsive utilities and components for application layout, navigation, cards, buttons, and forms.
- Preserve the Holocron visual theme with a dark background, gold accent (`#ffe81f`), and blue accent (`#4f9dff`) using a small custom stylesheet.
- Keep quiz answer selection feedback, navigation, and responsive profile/avatar layouts accessible and usable on mobile and desktop.
