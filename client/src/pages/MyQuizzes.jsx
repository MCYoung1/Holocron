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
      <div className="grid">
        <h1>My Quizzes</h1>
        <Link className="btn primary" to="/new">+ New quiz</Link>
      </div>

      {loading && <p className="muted">Loading your quizzes...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && quizzes.length === 0 && (
        <p className="muted">You haven’t created any quizzes yet.</p>
      )}
      {!loading && quizzes.length > 0 && (
        <div className="grid">
          {quizzes.map((quiz) => (
            <article className="card" key={quiz.id}>
              <span className="tag">{quiz.category}</span>
              <h2>{quiz.title}</h2>
              <p className="muted">{quiz.question_count} questions</p>
              <div className="grid">
                <Link className="btn" to={`/quiz/${quiz.id}`}>View</Link>
                <button
                  className="btn"
                  type="button"
                  onClick={() => deleteQuiz(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  {deletingId === quiz.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
