import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Auth from './pages/Auth.jsx';
import Browse from './pages/Browse.jsx';
import Home from './pages/Home.jsx';
import MyQuizzes from './pages/MyQuizzes.jsx';
import Play from './pages/Play.jsx';
import Profile from './pages/Profile.jsx';
import QuizDetail from './pages/QuizDetail.jsx';
import QuizForm from './pages/QuizForm.jsx';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-vh-100">
      <header className="navbar navbar-expand-lg site-header">
        <div className="container">
          <Link className="navbar-brand brand" to="/">Holocron</Link>
          <nav className="navbar-nav flex-row flex-wrap align-items-center gap-3" aria-label="Main navigation">
            <Link className="nav-link" to="/browse">Browse</Link>
            <Link className="nav-link" to="/my">My Quizzes</Link>
            <Link className="btn btn-warning" to="/new">+ New Quiz</Link>
            {user ? (
              <>
                <Link className="nav-link" to={`/users/${encodeURIComponent(user.username)}`}>My Profile</Link>
                <button className="btn btn-link nav-action" type="button" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <Link className="nav-link" to="/auth">Log in</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-4 py-md-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/quizzes/:id" element={<QuizDetail />} />
          <Route path="/quiz/:id/play" element={<Play />} />
          <Route path="/quizzes/:id/play" element={<Play />} />
          <Route path="/users/:username" element={<Profile />} />
          <Route path="/my" element={user ? <MyQuizzes /> : <Navigate to="/auth" replace />} />
          <Route path="/new" element={user ? <QuizForm /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
