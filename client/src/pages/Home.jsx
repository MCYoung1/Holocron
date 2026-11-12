import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section>
      <h1>Test your knowledge of a galaxy far, far away</h1>
      <p className="muted">
        Explore fan-made quizzes, challenge yourself, and see how well you know the galaxy.
      </p>
      <div className="grid">
        <Link className="btn primary" to="/browse">Browse quizzes</Link>
        <Link className="btn" to="/auth">Create a quiz</Link>
      </div>
    </section>
  );
}
