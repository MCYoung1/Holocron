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
    <section className="card">
      <h1>{isRegistering ? 'Create your account' : 'Log in'}</h1>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <p>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
          </p>
        )}
        <p>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
        </p>
        <p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
            />
          </label>
        </p>
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : isRegistering ? 'Register' : 'Log in'}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p className="muted">
        {isRegistering ? 'Already have an account?' : 'New to Holocron?'}{' '}
        <button className="nav-action" type="button" onClick={toggleMode}>
          {isRegistering ? 'Log in' : 'Register'}
        </button>
      </p>
    </section>
  );
}
