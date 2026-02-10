// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token non fornito' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    req.user = user;
    next();
  });
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autenticato' });
    }
    
    if (!allowedRoles.includes(req.user.tipo_utente)) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    next();
  };
};

const checkLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autenticato' });
    }
    
    if (req.user.livello_accesso < minLevel) {
      return res.status(403).json({ error: 'Livello di accesso insufficiente' });
    }
    
    next();
  };
};

module.exports = { authenticateToken, checkRole, checkLevel };
