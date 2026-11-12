import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Play() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQuestions([]);
    setQuestionIndex(0);
    setAnswers({});
    setScoreResult(null);

    api(`/quizzes/${id}/play`)
      .then((result) => {
        if (active) {
          setQuestions(result);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function submitAnswer(optionIndex) {
    const question = questions[questionIndex];
    const updatedAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(updatedAnswers);
    setError('');

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api(`/quizzes/${id}/attempts`, {
        method: 'POST',
        body: { answers: updatedAnswers },
      });
      setScoreResult(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="muted">Loading quiz...</p>;
  }

  if (error && questions.length === 0) {
    return <section className="card"><p role="alert">{error}</p></section>;
  }

  if (questions.length === 0) {
    return (
      <section className="card">
        <h1>Not enough questions</h1>
        <p className="muted">This quiz does not have any questions to play yet.</p>
        <Link className="btn" to={`/quizzes/${id}`}>Back to quiz</Link>
      </section>
    );
  }

  if (scoreResult) {
    return (
      <section className="card">
        <h1>Quiz complete</h1>
        <p>Your score: {scoreResult.score} / {scoreResult.total}</p>
        <Link className="btn primary" to={`/quizzes/${id}`}>Back to quiz</Link>
      </section>
    );
  }

  const question = questions[questionIndex];

  return (
    <section className="card">
      <p className="muted">Question {questionIndex + 1} / {questions.length}</p>
      <h1>{question.text}</h1>
      {error && <p role="alert">{error}</p>}
      <div className="options">
        {question.options.map((option, optionIndex) => (
          <button
            className="opt-row"
            type="button"
            key={`${question.id}-${optionIndex}`}
            onClick={() => submitAnswer(optionIndex)}
            disabled={submitting}
          >
            {option}
          </button>
        ))}
      </div>
      {submitting && <p className="muted">Submitting your score...</p>}
    </section>
  );
}
