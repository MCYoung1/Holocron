import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await api(isRegistering ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: isRegistering ? { username, email, password } : { email, password },
      });
      login(result.user, result.token);
      navigate('/my');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegistering(!isRegistering);
    setError('');
  }

  return (
    <section className="card holocron-card auth-card mx-auto">
      <div className="card-body p-4 p-md-5">
      <span className="tag mb-2">Welcome to Holocron</span>
      <h1 className="h2 mb-4">{isRegistering ? 'Create your account' : 'Log in'}</h1>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div className="mb-3">
            <label className="form-label w-100">
              Username
              <input
                className="form-control mt-1"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
          </div>
        )}
        <div className="mb-3">
          <label className="form-label w-100">
            Email
            <input
              className="form-control mt-1"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
        </div>
        <div className="mb-3">
          <label className="form-label w-100">
            Password
            <input
              className="form-control mt-1"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
            />
          </label>
        </div>
        <button className="btn btn-warning w-100" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : isRegistering ? 'Register' : 'Log in'}
        </button>
        {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
      </form>
      <p className="text-secondary mt-4 mb-0">
        {isRegistering ? 'Already have an account?' : 'New to Holocron?'}{' '}
        <button className="btn btn-link nav-action p-0" type="button" onClick={toggleMode}>
          {isRegistering ? 'Log in' : 'Register'}
        </button>
      </p>
      </div>
    </section>
  );
}
