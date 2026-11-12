# Holocron User Instructions

Holocron is a Star Wars quiz app for discovering quizzes, creating your own multiple-choice quizzes, and playing quizzes to see your score.

## What you can do

- **Browse quizzes:** View public quizzes, search by title, and see each quiz's category, author, difficulty, and number of questions.
- **View quiz details:** Read a quiz description and its details before starting.
- **Create an account or log in:** Register with a username, email, and password, or log in with an existing account.
- **Create and manage quizzes:** Signed-in users can create quizzes, add questions, view their own quizzes, and delete quizzes they own.
- **Play quizzes:** Choose an answer for each question. Holocron submits the answers to the server, which calculates and displays the score.

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

## Create a quiz

1. Sign in, then select **+ New Quiz** in the navigation (or **+ New quiz** from My Quizzes).
2. Enter a quiz **Title** and optional **Description**.
3. Choose a **Category**: Films, Characters, Planets, Vehicles, or Lore.
4. Choose a **Difficulty**: easy, medium, or hard.
5. In **Questions**, enter the question text.
6. Fill in all four answer option fields.
7. Select the radio button next to the correct option. This marks which answer the server should score as correct; the radio control itself is not a fifth answer.
8. Select **+ Add question** to add more questions. Each new question has its own four options and correct-answer selector.
9. To remove an extra question, select **Remove question**. At least one question must remain.
10. Select **Create quiz**. The app creates the quiz, saves its questions, then opens the new quiz's detail page.

If the server reports an error while creating the quiz or any question, the app displays the error in an alert. Since creation sends the quiz and questions as separate requests, a failure after the quiz was created can leave a quiz with only some of its questions; check **My Quizzes** before retrying.

## Browse and play

1. Select **Browse** in the top navigation.
2. Use **Search by title** to filter the public quiz list.
3. Select a quiz card to open its details.
4. Select **Start quiz**.
5. Choose one of the four answer buttons on each question. The app advances after each selection.
6. After the last answer is submitted, review the score and select **Back to quiz** to return to the quiz details.

Quizzes with no questions cannot be played yet; the app displays a message and a link back to the quiz.

## Manage your quizzes

1. Sign in and select **My Quizzes**.
2. Each card shows the quiz title, category, and question count.
3. Select **View** to open quiz details.
4. Select **Delete** and confirm to permanently delete that quiz and its questions.

The backend checks quiz ownership for quiz and question changes. Deleting a quiz also removes its associated questions and attempts from the database.
