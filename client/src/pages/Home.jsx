import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="p-4 p-md-5 mb-4 rounded-3 holocron-card">
      <div className="container-fluid py-3 py-md-5">
        <span className="tag mb-3">A galaxy of quizzes</span>
        <h1 className="display-4 fw-bold">Test your knowledge of a galaxy far, far away</h1>
        <p className="col-md-8 fs-5 text-secondary">
        Explore fan-made quizzes, challenge yourself, and see how well you know the galaxy.
        </p>
        <div className="d-flex flex-wrap gap-3 mt-4">
          <Link className="btn btn-warning btn-lg" to="/browse">Browse quizzes</Link>
          <Link className="btn btn-outline-primary btn-lg" to="/auth">Create a quiz</Link>
        </div>
      </div>
    </section>
  );
}
