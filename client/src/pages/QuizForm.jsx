import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const categories = ['Films', 'Characters', 'Planets', 'Vehicles', 'Lore'];
const difficulties = ['easy', 'medium', 'hard'];

function createQuestion() {
  return {
    text: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctIndex: 0,
  };
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

  function updateQuestionType(questionIndex, questionType) {
    const options = questionType === 'true_false'
      ? ['True', 'False']
      : ['', '', '', ''];
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? { ...question, questionType, options, correctIndex: 0 }
          : question,
      ),
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
            questionType: question.questionType,
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
    <section className="card holocron-card">
      <div className="card-body p-3 p-md-4">
      <span className="tag mb-2">Quiz creator</span>
      <h1 className="mb-4">Create a quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label w-100">
            Title
            <input
              className="form-control mt-1"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="mb-3">
          <label className="form-label w-100">
            Description
            <textarea
              className="form-control mt-1"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="3"
            />
          </label>
        </div>
        <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label w-100">
            Category
            <select className="form-select mt-1" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <div className="col-md-6">
          <label className="form-label w-100">
            Difficulty
            <select className="form-select mt-1" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficulties.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        </div>

        <h2 className="h4 mt-4 mb-3">Questions</h2>
        {questions.map((question, questionIndex) => (
          <fieldset className="card holocron-card mb-3" key={questionIndex}>
            <div className="card-body">
            <legend className="float-none w-auto px-2 fs-5">Question {questionIndex + 1}</legend>
            <div className="mb-3">
              <label className="form-label w-100">
                Question text
                <input
                  className="form-control mt-1"
                  type="text"
                  value={question.text}
                  onChange={(event) => updateQuestion(questionIndex, 'text', event.target.value)}
                  required
                />
              </label>
            </div>
            <div className="mb-3">
              <label className="form-label w-100">
                Question type
                <select
                  className="form-select mt-1"
                  value={question.questionType}
                  onChange={(event) => updateQuestionType(questionIndex, event.target.value)}
                >
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="true_false">True / False</option>
                </select>
              </label>
            </div>
            <div className="d-grid gap-2 mb-3">
              {question.options.map((option, optionIndex) => (
                <label className="opt-row" key={optionIndex}>
                  <input
                    className="form-check-input m-0"
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={question.correctIndex === optionIndex}
                    onChange={() => updateQuestion(questionIndex, 'correctIndex', optionIndex)}
                    aria-label={`Mark option ${optionIndex + 1} as correct`}
                  />
                  {question.questionType === 'true_false' ? (
                    <span>{option}</span>
                  ) : (
                    <input
                      className="form-control"
                      type="text"
                      value={option}
                      onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      aria-label={`Question ${questionIndex + 1}, option ${optionIndex + 1}`}
                      required
                    />
                  )}
                </label>
              ))}
            </div>
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => removeQuestion(questionIndex)}
              disabled={questions.length === 1}
            >
              Remove question
            </button>
            </div>
          </fieldset>
        ))}

        <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
          <button className="btn btn-outline-primary" type="button" onClick={() => setQuestions((current) => [...current, createQuestion()])}>
            + Add question
          </button>
          <button className="btn btn-warning" type="submit" disabled={submitting}>
            {submitting ? 'Creating quiz...' : 'Create quiz'}
          </button>
        </div>
      </form>
      </div>
    </section>
  );
}
