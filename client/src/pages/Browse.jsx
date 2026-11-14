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
      <div className="row align-items-end g-3 mb-4">
        <div className="col-md">
          <span className="tag mb-2">Discover</span>
          <h1 className="mb-0">Browse quizzes</h1>
        </div>
        <div className="col-12 col-md-5">
          <label className="w-100">
            <span className="form-label text-secondary">Search by title</span>
            <input
              className="form-control"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search quizzes"
            />
          </label>
        </div>
      </div>

      {loading && <p className="text-secondary">Loading quizzes...</p>}
      {!loading && error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && filteredQuizzes.length === 0 && (
        <div className="alert holocron-card border" role="status">
          {normalizedSearch ? 'No quizzes match your search.' : 'No quizzes yet.'}
        </div>
      )}
      {!loading && !error && filteredQuizzes.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {filteredQuizzes.map((quiz) => (
            <div className="col" key={quiz.id}>
              <article className="card holocron-card quiz-card">
                <div className="card-body d-flex flex-column">
                  <span className="tag align-self-start">{quiz.category}</span>
                  <h2 className="h4 mt-3"><Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link></h2>
                  <p className="text-secondary mt-auto mb-0">
                    by <Link to={`/users/${encodeURIComponent(quiz.author)}`}>{quiz.author}</Link>
                    {' · '}{quiz.question_count} questions · {quiz.difficulty}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
