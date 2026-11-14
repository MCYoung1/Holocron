import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

function progressKey(quizId) {
  return `holocron_quiz_${quizId}_progress`;
}

function readProgress(quizId, questions) {
  const saved = sessionStorage.getItem(progressKey(quizId));
  if (!saved) {
    return { answers: {}, questionIndex: 0 };
  }

  try {
    const progress = JSON.parse(saved);
    const questionIds = new Set(questions.map((question) => String(question.id)));
    const answers = Object.fromEntries(
      Object.entries(progress.answers ?? {}).filter(
        ([questionId, answerIndex]) =>
          questionIds.has(questionId) &&
          Number.isInteger(answerIndex) &&
          answerIndex >= 0 &&
          answerIndex < (questions.find((question) => String(question.id) === questionId)?.options.length ?? 0),
      ),
    );
    const questionIndex = Number.isInteger(progress.questionIndex)
      ? Math.min(Math.max(progress.questionIndex, 0), questions.length)
      : 0;

    return { answers, questionIndex };
  } catch {
    sessionStorage.removeItem(progressKey(quizId));
    return { answers: {}, questionIndex: 0 };
  }
}

export default function Play() {
  const { id } = useParams();
  const { token } = useAuth();
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
          const progress = readProgress(id, result);
          setQuestions(result);
          setAnswers(progress.answers);
          setQuestionIndex(progress.questionIndex);
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

  useEffect(() => {
    if (loading || questions.length === 0 || scoreResult) {
      return;
    }

    try {
      sessionStorage.setItem(
        progressKey(id),
        JSON.stringify({ answers, questionIndex }),
      );
    } catch (storageError) {
      setError(`Unable to save quiz progress in this browser session: ${storageError.message}`);
    }
  }, [answers, id, loading, questionIndex, questions.length, scoreResult]);

  function navigateToQuestion(nextIndex) {
    setError('');
    setQuestionIndex(Math.min(Math.max(nextIndex, 0), questions.length));
  }

  function selectAnswer(optionIndex) {
    const question = questions[questionIndex];
    setAnswers((current) => ({ ...current, [String(question.id)]: optionIndex }));
    setError('');
    setQuestionIndex(questionIndex + 1);
  }

  async function submitQuiz() {
    setSubmitting(true);
    setError('');

    try {
      const result = await api(`/quizzes/${id}/attempts`, {
        method: 'POST',
        body: { answers },
        token,
      });
      setScoreResult(result);
      sessionStorage.removeItem(progressKey(id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-secondary">Loading quiz...</p>;
  }

  if (error && questions.length === 0) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <section className="card holocron-card">
        <div className="card-body">
          <h1>Not enough questions</h1>
          <p className="text-secondary">This quiz does not have any questions to play yet.</p>
          <Link className="btn btn-outline-primary" to={`/quizzes/${id}`}>Back to quiz</Link>
        </div>
      </section>
    );
  }

  if (scoreResult) {
    return (
      <section className="card holocron-card shadow-sm">
        <div className="card-body p-4 p-md-5">
          <span className="tag mb-2">Results</span>
          <h1 className="mb-4">Quiz complete</h1>
          <div className="row g-3 mb-4">
            <div className="col-sm-4">
              <div className="card holocron-card h-100">
                <div className="card-body">
                  <p className="text-secondary mb-1">Score</p>
                  <strong className="stat-value">{scoreResult.score} / {scoreResult.total}</strong>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="card holocron-card h-100">
                <div className="card-body">
                  <p className="text-secondary mb-1">Percentage</p>
                  <strong className="stat-value">{scoreResult.percentage}%</strong>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="card holocron-card h-100">
                <div className="card-body">
                  <p className="text-secondary mb-1">Rank</p>
                  <strong className="stat-value fs-4">{scoreResult.rank}</strong>
                </div>
              </div>
            </div>
          </div>
          <Link className="btn btn-warning" to={`/quizzes/${id}`}>Back to quiz</Link>
        </div>
      </section>
    );
  }

  if (questionIndex === questions.length) {
    const answeredCount = Object.keys(answers).length;
    return (
      <section className="card holocron-card">
        <div className="card-body p-3 p-md-4">
          <h1>Review your answers</h1>
          <p className="text-secondary">
            Answered {answeredCount} of {questions.length}. Skipped questions count as incorrect.
          </p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="d-grid gap-2 mb-4">
            {questions.map((question, index) => (
              <button
                className="btn btn-outline-light text-start"
                type="button"
                key={question.id}
                onClick={() => navigateToQuestion(index)}
              >
                Question {index + 1}: {answers[String(question.id)] === undefined ? 'Skipped' : 'Answered'}
              </button>
            ))}
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <button className="btn btn-outline-primary" type="button" onClick={() => navigateToQuestion(questions.length - 1)}>
              Previous question
            </button>
            <button className="btn btn-warning" type="button" onClick={submitQuiz} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit quiz'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const question = questions[questionIndex];
  const selectedAnswer = answers[String(question.id)];

  return (
    <section className="card holocron-card">
      <div className="card-body p-3 p-md-5">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <p className="text-secondary mb-0">Question {questionIndex + 1} / {questions.length}</p>
          <span className="tag">{question.questionType === 'true_false' ? 'True / False' : 'Multiple choice'}</span>
        </div>
        <h1>{question.text}</h1>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="d-grid gap-2 my-4">
          {question.options.map((option, optionIndex) => (
            <button
              className="opt-row"
              type="button"
              key={`${question.id}-${optionIndex}`}
              onClick={() => selectAnswer(optionIndex)}
              disabled={submitting}
              aria-pressed={selectedAnswer === optionIndex}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="d-flex flex-column flex-sm-row flex-wrap gap-2">
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => navigateToQuestion(questionIndex - 1)}
            disabled={questionIndex === 0 || submitting}
          >
            Previous question
          </button>
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => navigateToQuestion(questionIndex + 1)}
            disabled={submitting}
          >
            {questionIndex === questions.length - 1 ? 'Review answers' : 'Next question'}
          </button>
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => navigateToQuestion(questionIndex + 1)}
            disabled={submitting}
          >
            Skip question
          </button>
        </div>
      </div>
    </section>
  );
}
