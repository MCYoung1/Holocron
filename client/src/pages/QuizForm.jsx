import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const categories = ['Films', 'Characters', 'Planets', 'Vehicles', 'Lore'];
const difficulties = ['easy', 'medium', 'hard'];

function createQuestion() {
  return { text: '', options: ['', '', '', ''], correctIndex: 0 };
}

export default function QuizForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [questions, setQuestions] = useState([createQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  function updateQuestion(questionIndex, key, value) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, [key]: value } : question,
      ),
    );
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }
        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    );
  }

  function removeQuestion(questionIndex) {
    setQuestions((current) => current.filter((_, index) => index !== questionIndex));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const quiz = await api('/quizzes', {
        method: 'POST',
        token,
        body: { title, description, category, difficulty },
      });

      for (const question of questions) {
        await api(`/quizzes/${quiz.id}/questions`, {
          method: 'POST',
          token,
          body: {
            text: question.text,
            options: question.options,
            correctIndex: question.correctIndex,
          },
        });
      }

      navigate(`/quiz/${quiz.id}`);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h1>Create a quiz</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
        </p>
        <p>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="3"
            />
          </label>
        </p>
        <p>
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </p>
        <p>
          <label>
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficulties.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </p>

        <h2>Questions</h2>
        {questions.map((question, questionIndex) => (
          <fieldset className="card" key={questionIndex}>
            <legend>Question {questionIndex + 1}</legend>
            <p>
              <label>
                Question text
                <input
                  type="text"
                  value={question.text}
                  onChange={(event) => updateQuestion(questionIndex, 'text', event.target.value)}
                  required
                />
              </label>
            </p>
            <div className="options">
              {question.options.map((option, optionIndex) => (
                <label className="opt-row" key={optionIndex}>
                  <input
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={question.correctIndex === optionIndex}
                    onChange={() => updateQuestion(questionIndex, 'correctIndex', optionIndex)}
                    aria-label={`Mark option ${optionIndex + 1} as correct`}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    aria-label={`Question ${questionIndex + 1}, option ${optionIndex + 1}`}
                    required
                  />
                </label>
              ))}
            </div>
            <button
              className="btn"
              type="button"
              onClick={() => removeQuestion(questionIndex)}
              disabled={questions.length === 1}
            >
              Remove question
            </button>
          </fieldset>
        ))}

        <div className="grid">
          <button className="btn" type="button" onClick={() => setQuestions((current) => [...current, createQuestion()])}>
            + Add question
          </button>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating quiz...' : 'Create quiz'}
          </button>
        </div>
      </form>
    </section>
  );
}
