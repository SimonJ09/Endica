// auth.js — Middleware d'authentification JWT
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_de_dev_a_changer';

// Vérifie que la requête contient un token valide
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Token manquant' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ erreur: 'Token invalide ou expiré' });
  }
}

// Vérifie que l'admin a un rôle autorisé
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ erreur: 'Non authentifié' });
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ erreur: 'Accès refusé' });
    }
    next();
  };
}

// Génère un token
export function genererToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}