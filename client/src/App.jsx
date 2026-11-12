import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Auth from './pages/Auth.jsx';
import Browse from './pages/Browse.jsx';
import Home from './pages/Home.jsx';
import MyQuizzes from './pages/MyQuizzes.jsx';
import Play from './pages/Play.jsx';
import QuizDetail from './pages/QuizDetail.jsx';
import QuizForm from './pages/QuizForm.jsx';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">Holocron</Link>
        <nav className="nav" aria-label="Main navigation">
          <Link to="/browse">Browse</Link>
          <Link to="/my">My Quizzes</Link>
          <Link className="btn primary" to="/new">+ New Quiz</Link>
          {user ? (
            <button className="nav-action" type="button" onClick={logout}>
              Log out
            </button>
          ) : (
            <Link to="/auth">Log in</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/quizzes/:id" element={<QuizDetail />} />
          <Route path="/quiz/:id/play" element={<Play />} />
          <Route path="/quizzes/:id/play" element={<Play />} />
          <Route path="/my" element={user ? <MyQuizzes /> : <Navigate to="/auth" replace />} />
          <Route path="/new" element={user ? <QuizForm /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
