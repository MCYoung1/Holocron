import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_URL, api } from '../api.js';
import { useAuth } from '../auth.jsx';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function Profile() {
  const { username } = useParams();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isOwner = user?.username === username;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProfile(null);

    api(`/users/${encodeURIComponent(username)}`)
      .then((result) => {
        if (active) {
          setProfile(result);
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
  }, [username]);

  async function uploadAvatar(event) {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }

    setError('');
    setNotice('');
    if (!AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_SIZE) {
      setError('Choose a JPEG, PNG, GIF, or WebP image no larger than 2 MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      await api('/me/avatar', {
        method: 'PUT',
        token,
        body: await file.arrayBuffer(),
        contentType: 'application/octet-stream',
        headers: { 'X-Avatar-Content-Type': file.type },
      });
      const updatedProfile = await api(`/users/${encodeURIComponent(username)}`);
      setProfile(updatedProfile);
      setNotice('Profile image updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  if (loading) {
    return <p className="text-secondary">Loading profile...</p>;
  }

  if (error && !profile) {
    return (
      <section className="card holocron-card">
        <div className="card-body">
          <h1>Profile unavailable</h1>
          <p className="text-danger" role="alert">{error}</p>
          <Link to="/browse">Browse quizzes</Link>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  const avatarUrl = profile.hasAvatar
    ? `${API_URL}/users/${encodeURIComponent(profile.username)}/avatar?v=${encodeURIComponent(profile.avatarUpdatedAt)}`
    : null;

  return (
    <section className="card holocron-card profile-card">
      <div className="card-body p-3 p-md-4">
      <div className="d-flex align-items-center flex-column flex-sm-row gap-3 gap-md-4 mb-4">
        {avatarUrl ? (
          <img className="profile-avatar" src={avatarUrl} alt={`${profile.username}'s avatar`} />
        ) : (
          <div className="profile-avatar profile-avatar-fallback" aria-label="No avatar uploaded">
            {profile.username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1>{profile.username}</h1>
          {isOwner && (
            <label className="btn btn-outline-primary profile-upload">
              {uploading ? 'Uploading...' : 'Upload avatar'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={uploadAvatar}
                disabled={uploading}
                aria-label="Upload profile avatar"
              />
            </label>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <h2 className="h4 mb-3">Statistics</h2>
      <div className="row row-cols-1 row-cols-sm-3 g-3">
        <article className="col">
          <div className="card holocron-card h-100"><div className="card-body">
          <p className="text-secondary">Quizzes Created</p>
          <strong className="stat-value">{profile.quizzesCreated}</strong>
          </div></div>
        </article>
        <article className="col">
          <div className="card holocron-card h-100"><div className="card-body">
          <p className="text-secondary">Quizzes Played</p>
          <strong className="stat-value">{profile.quizzesPlayed}</strong>
          </div></div>
        </article>
        <article className="col">
          <div className="card holocron-card h-100"><div className="card-body">
          <p className="text-secondary">Average Score</p>
          <strong className="stat-value">{Number(profile.averageScore).toFixed(1)}%</strong>
          </div></div>
        </article>
      </div>
      <p className="text-secondary small mt-3 mb-0">
        Played count and average score are based on recorded attempts for this account.
      </p>
      </div>
    </section>
  );
}
