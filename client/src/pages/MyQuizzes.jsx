import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function MyQuizzes() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api('/me/quizzes', { token });
      setQuizzes(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  async function deleteQuiz(quiz) {
    if (!window.confirm(`Delete "${quiz.title}" and all of its questions?`)) {
      return;
    }

    setDeletingId(quiz.id);
    setError('');
    try {
      await api(`/quizzes/${quiz.id}`, { method: 'DELETE', token });
      await loadQuizzes();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <span className="tag mb-2">Your collection</span>
          <h1 className="mb-0">My Quizzes</h1>
        </div>
        <Link className="btn btn-warning" to="/new">+ New quiz</Link>
      </div>

      {loading && <p className="text-secondary">Loading your quizzes...</p>}
      {!loading && error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && quizzes.length === 0 && (
        <div className="alert holocron-card border" role="status">You haven’t created any quizzes yet.</div>
      )}
      {!loading && quizzes.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {quizzes.map((quiz) => (
            <div className="col" key={quiz.id}>
            <article className="card holocron-card h-100">
              <div className="card-body d-flex flex-column">
              <span className="tag align-self-start">{quiz.category}</span>
              <h2 className="h4 mt-3">{quiz.title}</h2>
              <p className="text-secondary">{quiz.question_count} questions</p>
              <div className="d-flex gap-2 mt-auto">
                <Link className="btn btn-outline-primary" to={`/quiz/${quiz.id}`}>View</Link>
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={() => deleteQuiz(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  {deletingId === quiz.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              </div>
            </article>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
