import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || null;
    if (!token) {
      return next(new Error('Unauthorized'));
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    socket.userId = payload.userId;
    return next();
  } catch (e) {
    return next(new Error('Unauthorized'));
  }
}
