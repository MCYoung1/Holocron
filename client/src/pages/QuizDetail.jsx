import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setQuiz(null);
    setError('');
    setLoading(true);

    api(`/quizzes/${id}`)
      .then((result) => {
        if (active) {
          setQuiz(result);
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

  if (loading) {
    return <p className="muted">Loading quiz...</p>;
  }

  if (error === 'Quiz not found.') {
    return <section className="card"><h1>Quiz not found</h1></section>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!quiz) {
    return <section className="card"><h1>Quiz not found</h1></section>;
  }

  return (
    <article className="card">
      <span className="tag">{quiz.category}</span>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      <p className="muted">
        by {quiz.author} · {quiz.question_count} questions · {quiz.difficulty}
      </p>
      <Link className="btn primary" to={`/quiz/${quiz.id}/play`}>Start quiz</Link>
    </article>
  );
}
