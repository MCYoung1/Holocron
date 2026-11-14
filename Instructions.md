# Holocron User Instructions

Holocron is a Star Wars quiz app for discovering quizzes, creating your own multiple-choice quizzes, and playing quizzes to see your score.

The responsive interface uses Bootstrap 5 with Holocron's dark background, gold, and blue theme.

## What you can do

- **Browse quizzes:** View public quizzes, search by title, and see each quiz's category, author, difficulty, and number of questions.
- **View quiz details:** Read a quiz description and its details before starting.
- **Create an account or log in:** Register with a username, email, and password, or log in with an existing account.
- **Create and manage quizzes:** Signed-in users can create quizzes, add questions, view their own quizzes, and delete quizzes they own.
- **Play quizzes:** Choose an answer for each question. Holocron submits the answers to the server, which calculates and displays the score.
- **View profiles:** Select a quiz author's name or **My Profile** to see a public profile with quiz statistics.
- **Upload an avatar:** From your own profile, select **Upload avatar** and choose a JPEG, PNG, GIF, or WebP image up to 2 MB.

Correct answers are not included in the questions sent to the browser before a quiz is submitted. The server checks answers against the quiz's saved answer key.

## Start the application

First configure PostgreSQL and the server/client environment variables as described in [README.md](./README.md). Start the API and frontend in separate terminals:

```powershell
Set-Location C:\path\to\holocron\server
npm.cmd run dev
```

```powershell
Set-Location C:\path\to\holocron\client
npm.cmd run dev
```

Open the Vite address shown in the client terminal, normally `http://localhost:5173`. The client API URL must point to the running server; local defaults are documented in the README.

## Register or log in

1. Select **Log in** in the top navigation.
2. To make a new account, select **Register** and enter a username, email, and password.
3. Submit the form. After successful registration or login, Holocron sends you to **My Quizzes**.

Quiz browsing and playing are public. You need to be signed in to create, list, or delete your own quizzes.

## View and update a profile

1. Select **My Profile** in the navigation while signed in, or select an author's name on a quiz card or detail page.
2. The public profile displays the username, avatar (or an initial if no image has been uploaded), quizzes created, quizzes played, and average score.
3. On your own profile, select **Upload avatar** and choose a JPEG, PNG, GIF, or WebP image no larger than 2 MB.

Quizzes played and average score are calculated from completed attempts made while signed in. Anonymous attempts are not attributed to a profile.

## Create a quiz

1. Sign in, then select **+ New Quiz** in the navigation (or **+ New quiz** from My Quizzes).
2. Enter a quiz **Title** and optional **Description**.
3. Choose a **Category**: Films, Characters, Planets, Vehicles, or Lore.
4. Choose a **Difficulty**: easy, medium, or hard.
5. In **Questions**, enter the question text.
6. Choose **Multiple choice** for four custom answers, or **True / False** for the two fixed answers.
7. Select the radio button next to the correct answer. This marks which answer the server should score as correct; the radio control itself is not an answer option.
8. Select **+ Add question** to add more questions. Each new question has its own type and correct-answer selector.
9. To remove an extra question, select **Remove question**. At least one question must remain.
10. Select **Create quiz**. The app creates the quiz, saves its questions, then opens the new quiz's detail page.

If the server reports an error while creating the quiz or any question, the app displays the error in an alert. Since creation sends the quiz and questions as separate requests, a failure after the quiz was created can leave a quiz with only some of its questions; check **My Quizzes** before retrying.

## Browse and play

1. Select **Browse** in the top navigation.
2. Use **Search by title** to filter the public quiz list.
3. Select a quiz card to open its details.
4. Select **Start quiz**.
5. Choose one of the answer buttons on each question (four for multiple choice or two for True/False). The app advances after each selection.
6. After answering the questions, review which questions were answered or skipped. You can reopen any question before submitting.
7. Select **Submit quiz**. The results show your score, percentage, and rank; each completed attempt is recorded in the database.
8. Select **Back to quiz** to return to the quiz details.

Ranks are awarded by percentage: 0–39% is **Youngling**, 40–59% **Padawan**, 60–79% **Jedi Knight**, 80–94% **Jedi Master**, and 95–100% **Lore Keeper**. Percentages are rounded to the nearest whole number for rank assignment and display.

Quizzes with no questions cannot be played yet; the app displays a message and a link back to the quiz.

## Manage your quizzes

1. Sign in and select **My Quizzes**.
2. Each card shows the quiz title, category, and question count.
3. Select **View** to open quiz details.
4. Select **Delete** and confirm to permanently delete that quiz and its questions.

The backend checks quiz ownership for quiz and question changes. Deleting a quiz also removes its associated questions and attempts from the database.
