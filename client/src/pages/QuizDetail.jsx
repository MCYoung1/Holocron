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
    return <p className="text-secondary">Loading quiz...</p>;
  }

  if (error === 'Quiz not found.') {
    return <section className="card holocron-card"><div className="card-body"><h1>Quiz not found</h1></div></section>;
  }

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  if (!quiz) {
    return <section className="card holocron-card"><div className="card-body"><h1>Quiz not found</h1></div></section>;
  }

  return (
    <article className="card holocron-card shadow-sm">
      <div className="card-body p-4 p-md-5">
      <span className="tag">{quiz.category}</span>
      <h1 className="display-6 mt-3">{quiz.title}</h1>
      <p className="fs-5">{quiz.description}</p>
      <p className="text-secondary">
        by <Link to={`/users/${encodeURIComponent(quiz.author)}`}>{quiz.author}</Link>
        {' · '}{quiz.question_count} questions · {quiz.difficulty}
      </p>
      <Link className="btn btn-warning btn-lg mt-2" to={`/quiz/${quiz.id}/play`}>Start quiz</Link>
      </div>
    </article>
  );
}
