import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Browse() {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api('/quizzes')
      .then((result) => {
        if (active) {
          setQuizzes(result);
          setError('');
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
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(normalizedSearch),
  );

  return (
    <section>
      <h1>Browse quizzes</h1>
      <label>
        <span className="muted">Search by title</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search quizzes"
        />
      </label>

      {loading && <p className="muted">Loading quizzes...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && filteredQuizzes.length === 0 && (
        <p className="muted">
          {normalizedSearch ? 'No quizzes match your search.' : 'No quizzes yet.'}
        </p>
      )}
      {!loading && !error && filteredQuizzes.length > 0 && (
        <div className="grid">
          {filteredQuizzes.map((quiz) => (
            <Link className="card" to={`/quizzes/${quiz.id}`} key={quiz.id}>
              <span className="tag">{quiz.category}</span>
              <h2>{quiz.title}</h2>
              <p className="muted">
                by {quiz.author} · {quiz.question_count} questions · {quiz.difficulty}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
