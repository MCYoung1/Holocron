import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set in the server environment.');
  }
  return secret;
}

export function sign(user) {
  return jwt.sign(
    { username: user.username, email: user.email },
    getJwtSecret(),
    { subject: String(user.id), expiresIn: '7d' },
  );
}

export function requireAuth(request, response, next) {
  const authorization = request.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return response.status(401).json({ error: 'Authorization token required.' });
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload !== 'object' || !payload.sub) {
      return response.status(401).json({ error: 'Invalid authorization token.' });
    }

    request.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return response.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
}

export function optionalAuth(request, response, next) {
  const authorization = request.get('authorization') || '';
  if (!authorization) {
    return next();
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return response.status(401).json({ error: 'Invalid authorization token.' });
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload !== 'object' || !payload.sub) {
      return response.status(401).json({ error: 'Invalid authorization token.' });
    }

    request.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return response.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
}
