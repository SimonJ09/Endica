// server.js — Serveur principal
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole, genererToken } from './auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import './init-admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARES ----------
//app.use(cors());
// ---------- CORS ----------
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];


app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (curl, Postman…)
    if (!origin) return callback(null, true);

    // Autorise explicitement les origines listées
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    // Autorise tous les sous-domaines Vercel
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Autorise l'URL définie dans FRONTEND_URL (si présente)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // Autorise un futur nom de domaine perso si défini
    if (process.env.CUSTOM_DOMAIN && origin === process.env.CUSTOM_DOMAIN) {
      return callback(null, true);
    }

    console.error('❌ CORS refusé pour :', origin);
    callback(new Error('CORS non autorisé'));
  },
  credentials: true,
}));

app.use(express.json()); 

// ---------- CONFIGURATION MULTER (uploads) ----------
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nom = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, nom);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (req, file, cb) => {
    const autorises = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'application/pdf',
    ];
    if (autorises.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  },
});

// Servir les fichiers statiques
app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- ROUTE DE TEST ----------
app.get('/', (req, res) => {
  res.json({
    message: 'API Remèdes du terroir',
    version: '1.0.0',
    status: 'ok'
  });
});

// ---------- ROUTE : LISTE DES REMÈDES ----------
app.get('/api/remedes', (req, res) => {
  try {
    const remedes = db.prepare(`
      SELECT id, nom_local, nom_scientifique, region_origine,
             niveau_fiabilite, statut, vues, likes, date_ajout
      FROM remedes
      WHERE statut = 'publie'
      ORDER BY date_ajout DESC
      LIMIT 50
    `).all();

    res.json({ total: remedes.length, remedes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ROUTE : DÉTAIL D'UN REMÈDE ----------
app.get('/api/remedes/:id', (req, res) => {
  try {
    const remede = db.prepare('SELECT * FROM remedes WHERE id = ?').get(req.params.id);

    if (!remede) {
      return res.status(404).json({ erreur: 'Remède introuvable' });
    }

    // Incrémenter les vues (simple pour l'instant)
    db.prepare('UPDATE remedes SET vues = vues + 1 WHERE id = ?').run(req.params.id);

    // Récupérer les ingrédients liés
    const ingredients = db.prepare(`
      SELECT i.*, ri.quantite, ri.unite
      FROM ingredients i
      JOIN remede_ingredients ri ON ri.ingredient_id = i.id
      WHERE ri.remede_id = ?
    `).all(req.params.id);

    // Récupérer les indications liées
    const indications = db.prepare(`
      SELECT ind.*
      FROM indications ind
      JOIN remede_indications ri ON ri.indication_id = ind.id
      WHERE ri.remede_id = ?
    `).all(req.params.id);

    res.json({ ...remede, ingredients, indications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- LISTE DES INGRÉDIENTS ----------
app.get('/api/ingredients', (req, res) => {
  try {
    const ingredients = db.prepare(`
      SELECT i.*, COUNT(ri.remede_id) as nb_remedes
      FROM ingredients i
      LEFT JOIN remede_ingredients ri ON ri.ingredient_id = i.id
      GROUP BY i.id
      ORDER BY i.nom ASC
    `).all();
    res.json({ total: ingredients.length, ingredients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- REMÈDES UTILISANT UN INGRÉDIENT ----------
app.get('/api/ingredients/:id/remedes', (req, res) => {
  try {
    const ingredient = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ erreur: 'Ingrédient introuvable' });
    }

    const remedes = db.prepare(`
      SELECT r.id, r.nom_local, r.nom_scientifique, r.region_origine,
             r.niveau_fiabilite, r.vues, r.likes,
             ri.quantite, ri.unite
      FROM remedes r
      JOIN remede_ingredients ri ON ri.remede_id = r.id
      WHERE ri.ingredient_id = ? AND r.statut = 'publie'
      ORDER BY r.nom_local ASC
    `).all(req.params.id);

    res.json({ ingredient, total: remedes.length, remedes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- LISTE DES INDICATIONS ----------
app.get('/api/indications', (req, res) => {
  try {
    const indications = db.prepare(`
      SELECT ind.*, COUNT(ri.remede_id) as nb_remedes
      FROM indications ind
      LEFT JOIN remede_indications ri ON ri.indication_id = ind.id
      GROUP BY ind.id
      ORDER BY ind.nom ASC
    `).all();
    res.json({ total: indications.length, indications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- REMÈDES ASSOCIÉS À UNE INDICATION ----------
app.get('/api/indications/:id/remedes', (req, res) => {
  try {
    const indication = db.prepare('SELECT * FROM indications WHERE id = ?').get(req.params.id);
    if (!indication) {
      return res.status(404).json({ erreur: 'Indication introuvable' });
    }

    const remedes = db.prepare(`
      SELECT r.id, r.nom_local, r.nom_scientifique, r.region_origine,
             r.niveau_fiabilite, r.vues, r.likes
      FROM remedes r
      JOIN remede_indications ri ON ri.remede_id = r.id
      WHERE ri.indication_id = ? AND r.statut = 'publie'
      ORDER BY r.niveau_fiabilite DESC, r.nom_local ASC
    `).all(req.params.id);

    // Formulation prudente imposée par le cahier des charges
    res.json({
      indication,
      message: 'Remèdes traditionnellement rapportés pour cette indication',
      total: remedes.length,
      remedes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- RECHERCHE GÉNÉRALE ----------
app.get('/api/recherche', (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ erreur: 'Paramètre q requis' });
    }

    const like = `%${q}%`;

    const remedes = db.prepare(`
      SELECT id, nom_local, nom_scientifique, region_origine,
             niveau_fiabilite, vues, likes
      FROM remedes
      WHERE statut = 'publie'
        AND (nom_local LIKE ? OR nom_scientifique LIKE ? OR description LIKE ? OR region_origine LIKE ?)
      ORDER BY niveau_fiabilite DESC
      LIMIT 50
    `).all(like, like, like, like);

    const ingredients = db.prepare(`
      SELECT id, nom, nom_local, nom_scientifique, partie_utilisee
      FROM ingredients
      WHERE nom LIKE ? OR nom_local LIKE ? OR nom_scientifique LIKE ?
      LIMIT 50
    `).all(like, like, like);

    const indications = db.prepare(`
      SELECT id, nom, synonymes, type
      FROM indications
      WHERE nom LIKE ? OR synonymes LIKE ?
      LIMIT 50
    `).all(like, like);

    res.json({
      requete: q,
      total: remedes.length + ingredients.length + indications.length,
      remedes,
      ingredients,
      indications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- COMMENTAIRES D'UN REMÈDE (publics uniquement) ----------
app.get('/api/remedes/:id/comments', (req, res) => {
  try {
    const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) {
      return res.status(404).json({ erreur: 'Remède introuvable' });
    }

    const commentaires = db.prepare(`
      SELECT id, pseudonyme, contenu, date_ajout
      FROM commentaires
      WHERE remede_id = ? AND statut = 'publie'
      ORDER BY date_ajout DESC
      LIMIT 100
    `).all(req.params.id);

    res.json({ total: commentaires.length, commentaires });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- POSTER UN COMMENTAIRE ----------
app.post('/api/remedes/:id/comments', (req, res) => {
  try {
    const { pseudonyme, contenu } = req.body;

    // Validations
    if (!pseudonyme || !contenu) {
      return res.status(400).json({ erreur: 'Pseudonyme et contenu requis' });
    }
    if (pseudonyme.length < 2 || pseudonyme.length > 50) {
      return res.status(400).json({ erreur: 'Pseudonyme : 2 à 50 caractères' });
    }
    if (contenu.length < 5 || contenu.length > 2000) {
      return res.status(400).json({ erreur: 'Commentaire : 5 à 2000 caractères' });
    }

    const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) {
      return res.status(404).json({ erreur: 'Remède introuvable' });
    }

    const result = db.prepare(`
      INSERT INTO commentaires (remede_id, pseudonyme, contenu, statut)
      VALUES (?, ?, ?, 'en_attente')
    `).run(req.params.id, pseudonyme.trim(), contenu.trim());

    res.status(201).json({
      message: 'Commentaire enregistré. Il sera publié après modération.',
      id: result.lastInsertRowid,
      statut: 'en_attente'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- SIGNALER UN COMMENTAIRE ----------
app.post('/api/comments/:id/report', (req, res) => {
  try {
    const { motif, details } = req.body;

    if (!motif) {
      return res.status(400).json({ erreur: 'Motif requis' });
    }

    const commentaire = db.prepare('SELECT id FROM commentaires WHERE id = ?').get(req.params.id);
    if (!commentaire) {
      return res.status(404).json({ erreur: 'Commentaire introuvable' });
    }

    const result = db.prepare(`
      INSERT INTO signalements (type_cible, cible_id, motif, details, statut)
      VALUES ('commentaire', ?, ?, ?, 'nouveau')
    `).run(req.params.id, motif, details || null);

    res.status(201).json({
      message: 'Signalement enregistré. Merci.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- LIKER UN REMÈDE ----------
app.post('/api/remedes/:id/like', (req, res) => {
  try {
    const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) {
      return res.status(404).json({ erreur: 'Remède introuvable' });
    }

    // Fingerprint simple : IP + User-Agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const fingerprint = `${ip}::${ua}`;

    // Déjà liké ?
    const deja = db.prepare(
      'SELECT id FROM likes WHERE remede_id = ? AND fingerprint = ?'
    ).get(req.params.id, fingerprint);

    if (deja) {
      return res.status(409).json({ erreur: 'Vous avez déjà liké ce remède' });
    }

    // Transaction : insérer le like + incrémenter le compteur
    const transaction = db.transaction(() => {
      db.prepare(
        'INSERT INTO likes (remede_id, fingerprint) VALUES (?, ?)'
      ).run(req.params.id, fingerprint);

      db.prepare(
        'UPDATE remedes SET likes = likes + 1 WHERE id = ?'
      ).run(req.params.id);
    });

    transaction();

    const remedeMaj = db.prepare('SELECT likes FROM remedes WHERE id = ?').get(req.params.id);

    res.status(201).json({
      message: 'Like enregistré',
      likes: remedeMaj.likes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- CONNEXION ADMIN ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ erreur: 'Email et mot de passe requis' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());

    if (!admin) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }

    const ok = await bcrypt.compare(motDePasse, admin.mot_de_passe_hash);
    if (!ok) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }

    const token = genererToken(admin);

    // Log l'action
    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, details)
      VALUES (?, 'connexion', 'auth', ?)
    `).run(admin.id, `Connexion depuis ${req.socket.remoteAddress}`);

    res.json({
      message: 'Connexion réussie',
      token,
      admin: { id: admin.id, email: admin.email, nom: admin.nom, role: admin.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- QUI SUIS-JE ? (vérifier son token) ----------
app.get('/api/auth/me', requireAuth, (req, res) => {
  const admin = db.prepare('SELECT id, email, nom, role FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin) return res.status(404).json({ erreur: 'Admin introuvable' });
  res.json({ admin });
});

// ---------- ADMIN : LISTER LES COMMENTAIRES EN ATTENTE ----------
app.get('/api/admin/commentaires/en-attente', requireAuth, (req, res) => {
  try {
    const commentaires = db.prepare(`
      SELECT c.id, c.pseudonyme, c.contenu, c.statut, c.date_ajout,
             r.id as remede_id, r.nom_local as remede_nom
      FROM commentaires c
      JOIN remedes r ON r.id = c.remede_id
      WHERE c.statut = 'en_attente'
      ORDER BY c.date_ajout ASC
    `).all();

    res.json({ total: commentaires.length, commentaires });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CHANGER LE STATUT D'UN COMMENTAIRE ----------
app.patch('/api/admin/commentaires/:id/statut', requireAuth, requireRole('admin', 'moderateur'), (req, res) => {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'publie', 'rejete', 'masque'];

    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ erreur: 'Statut invalide' });
    }

    const commentaire = db.prepare('SELECT id FROM commentaires WHERE id = ?').get(req.params.id);
    if (!commentaire) {
      return res.status(404).json({ erreur: 'Commentaire introuvable' });
    }

    db.prepare('UPDATE commentaires SET statut = ? WHERE id = ?').run(statut, req.params.id);

    // Log
    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'modification_statut_commentaire', 'commentaire', ?, ?)
    `).run(req.admin.id, req.params.id, `Nouveau statut : ${statut}`);

    res.json({ message: 'Statut mis à jour', id: req.params.id, statut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : LISTER LES SIGNALEMENTS ----------
app.get('/api/admin/signalements', requireAuth, (req, res) => {
  try {
    const signalements = db.prepare(`
      SELECT s.*, c.pseudonyme, c.contenu
      FROM signalements s
      LEFT JOIN commentaires c ON c.id = s.cible_id AND s.type_cible = 'commentaire'
      ORDER BY s.date_ajout DESC
      LIMIT 200
    `).all();
    res.json({ total: signalements.length, signalements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : TRAITER UN SIGNALEMENT ----------
app.patch('/api/admin/signalements/:id', requireAuth, requireRole('admin', 'moderateur'), (req, res) => {
  try {
    const { statut } = req.body; // 'traite' | 'rejete' | 'nouveau'
    const valides = ['nouveau', 'traite', 'rejete'];
    if (!valides.includes(statut)) {
      return res.status(400).json({ erreur: 'Statut invalide' });
    }

    const signalement = db.prepare('SELECT id FROM signalements WHERE id = ?').get(req.params.id);
    if (!signalement) return res.status(404).json({ erreur: 'Signalement introuvable' });

    db.prepare('UPDATE signalements SET statut = ? WHERE id = ?').run(statut, req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'traitement_signalement', 'signalement', ?, ?)
    `).run(req.admin.id, req.params.id, `Nouveau statut : ${statut}`);

    res.json({ message: 'Signalement mis à jour', id: req.params.id, statut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});


// ---------- ADMIN : LISTER TOUS LES REMÈDES (tous statuts) ----------
app.get('/api/admin/remedes', requireAuth, (req, res) => {
  try {
    const remedes = db.prepare(`
      SELECT r.id, r.nom_local, r.nom_scientifique, r.region_origine,
             r.niveau_fiabilite, r.statut, r.vues, r.likes, r.date_ajout,
             (SELECT COUNT(*) FROM remede_ingredients WHERE remede_id = r.id) as nb_ingredients,
             (SELECT COUNT(*) FROM remede_indications WHERE remede_id = r.id) as nb_indications
      FROM remedes r
      ORDER BY r.date_ajout DESC
    `).all();
    res.json({ total: remedes.length, remedes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CRÉER UN REMÈDE ----------
app.post('/api/admin/remedes', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const {
      nom_local, nom_scientifique, description, mode_preparation,
      posologie, region_origine, niveau_fiabilite, statut,
      ingredients = [], indications = [],
    } = req.body;

    if (!nom_local || !nom_local.trim()) {
      return res.status(400).json({ erreur: 'nom_local est obligatoire' });
    }
    const niveau = parseInt(niveau_fiabilite) || 1;
    if (niveau < 1 || niveau > 5) {
      return res.status(400).json({ erreur: 'niveau_fiabilite doit être entre 1 et 5' });
    }

    const statutValide = ['en_attente', 'publie', 'rejete', 'archive'].includes(statut)
      ? statut : 'en_attente';

    const creer = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO remedes (
          nom_local, nom_scientifique, description, mode_preparation,
          posologie, region_origine, niveau_fiabilite, statut, ajoute_par
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nom_local.trim(), nom_scientifique || null, description || null,
        mode_preparation || null, posologie || null, region_origine || null,
        niveau, statutValide, req.admin.email
      );

      const remedeId = result.lastInsertRowid;

      const insIng = db.prepare(
        'INSERT INTO remede_ingredients (remede_id, ingredient_id) VALUES (?, ?)'
      );
      for (const ingId of ingredients) insIng.run(remedeId, ingId);

      const insInd = db.prepare(
        'INSERT INTO remede_indications (remede_id, indication_id) VALUES (?, ?)'
      );
      for (const indId of indications) insInd.run(remedeId, indId);

      db.prepare(`
        INSERT INTO logs (admin_id, action, cible, cible_id, details)
        VALUES (?, 'creation_remede', 'remede', ?, ?)
      `).run(req.admin.id, remedeId, `Création : ${nom_local}`);

      return remedeId;
    });

    const newId = creer();
    res.status(201).json({ message: 'Remède créé', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : MODIFIER UN REMÈDE ----------
app.put('/api/admin/remedes/:id', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) return res.status(404).json({ erreur: 'Remède introuvable' });

    const {
      nom_local, nom_scientifique, description, mode_preparation,
      posologie, region_origine, niveau_fiabilite, statut,
      ingredients, indications,
    } = req.body;

    if (!nom_local || !nom_local.trim()) {
      return res.status(400).json({ erreur: 'nom_local est obligatoire' });
    }

    const niveau = parseInt(niveau_fiabilite) || 1;
    const statutValide = ['en_attente', 'publie', 'rejete', 'archive'].includes(statut)
      ? statut : 'en_attente';

    const modifier = db.transaction(() => {
      db.prepare(`
        UPDATE remedes SET
          nom_local = ?, nom_scientifique = ?, description = ?,
          mode_preparation = ?, posologie = ?, region_origine = ?,
          niveau_fiabilite = ?, statut = ?, modifie_par = ?,
          date_modification = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        nom_local.trim(), nom_scientifique || null, description || null,
        mode_preparation || null, posologie || null, region_origine || null,
        niveau, statutValide, req.admin.email, req.params.id
      );

      if (Array.isArray(ingredients)) {
        db.prepare('DELETE FROM remede_ingredients WHERE remede_id = ?').run(req.params.id);
        const insIng = db.prepare(
          'INSERT INTO remede_ingredients (remede_id, ingredient_id) VALUES (?, ?)'
        );
        for (const ingId of ingredients) insIng.run(req.params.id, ingId);
      }

      if (Array.isArray(indications)) {
        db.prepare('DELETE FROM remede_indications WHERE remede_id = ?').run(req.params.id);
        const insInd = db.prepare(
          'INSERT INTO remede_indications (remede_id, indication_id) VALUES (?, ?)'
        );
        for (const indId of indications) insInd.run(req.params.id, indId);
      }

      db.prepare(`
        INSERT INTO logs (admin_id, action, cible, cible_id, details)
        VALUES (?, 'modification_remede', 'remede', ?, ?)
      `).run(req.admin.id, req.params.id, `Modification : ${nom_local}`);
    });

    modifier();
    res.json({ message: 'Remède mis à jour', id: parseInt(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CHANGER LE STATUT D'UN REMÈDE ----------
app.patch('/api/admin/remedes/:id/statut', requireAuth, requireRole('admin', 'moderateur', 'scientifique'), (req, res) => {
  try {
    const { statut } = req.body;
    const valides = ['en_attente', 'publie', 'rejete', 'archive'];
    if (!valides.includes(statut)) {
      return res.status(400).json({ erreur: 'Statut invalide' });
    }

    const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) return res.status(404).json({ erreur: 'Remède introuvable' });

    db.prepare('UPDATE remedes SET statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?')
      .run(statut, req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'changement_statut_remede', 'remede', ?, ?)
    `).run(req.admin.id, req.params.id, `Nouveau statut : ${statut}`);

    res.json({ message: 'Statut mis à jour', id: req.params.id, statut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : SUPPRIMER UN REMÈDE ----------
app.delete('/api/admin/remedes/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const remede = db.prepare('SELECT nom_local FROM remedes WHERE id = ?').get(req.params.id);
    if (!remede) return res.status(404).json({ erreur: 'Remède introuvable' });

    db.prepare('DELETE FROM remedes WHERE id = ?').run(req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'suppression_remede', 'remede', ?, ?)
    `).run(req.admin.id, req.params.id, `Suppression : ${remede.nom_local}`);

    res.json({ message: 'Remède supprimé', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqdWRlYWdvaG91bmRqZUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3OTExMzE5NjYsImV4cCI6MTc5MTczNjc2Nn0.p7oGHjhoxKhsukGAVeblgfS5gObpd9UokiJUogmwkr0

// ---------- ADMIN : LISTER TOUS LES INGRÉDIENTS ----------
app.get('/api/admin/ingredients', requireAuth, (req, res) => {
  try {
    const ingredients = db.prepare(`
      SELECT i.*, COUNT(ri.remede_id) as nb_remedes
      FROM ingredients i
      LEFT JOIN remede_ingredients ri ON ri.ingredient_id = i.id
      GROUP BY i.id
      ORDER BY i.nom ASC
    `).all();
    res.json({ total: ingredients.length, ingredients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CRÉER UN INGRÉDIENT ----------
app.post('/api/admin/ingredients', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const { nom, nom_local, nom_scientifique, description, partie_utilisee, source } = req.body;
    if (!nom || !nom.trim()) {
      return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }

    const existant = db.prepare('SELECT id FROM ingredients WHERE nom = ?').get(nom.trim());
    if (existant) {
      return res.status(409).json({ erreur: 'Cet ingrédient existe déjà' });
    }

    const result = db.prepare(`
      INSERT INTO ingredients (nom, nom_local, nom_scientifique, description, partie_utilisee, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      nom.trim(), nom_local || null, nom_scientifique || null,
      description || null, partie_utilisee || null, source || null
    );

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'creation_ingredient', 'ingredient', ?, ?)
    `).run(req.admin.id, result.lastInsertRowid, `Création : ${nom}`);

    res.status(201).json({ message: 'Ingrédient créé', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : MODIFIER UN INGRÉDIENT ----------
app.put('/api/admin/ingredients/:id', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const ing = db.prepare('SELECT id FROM ingredients WHERE id = ?').get(req.params.id);
    if (!ing) return res.status(404).json({ erreur: 'Ingrédient introuvable' });

    const { nom, nom_local, nom_scientifique, description, partie_utilisee, source } = req.body;
    if (!nom || !nom.trim()) {
      return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }

    db.prepare(`
      UPDATE ingredients SET nom = ?, nom_local = ?, nom_scientifique = ?,
        description = ?, partie_utilisee = ?, source = ?
      WHERE id = ?
    `).run(
      nom.trim(), nom_local || null, nom_scientifique || null,
      description || null, partie_utilisee || null, source || null,
      req.params.id
    );

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'modification_ingredient', 'ingredient', ?, ?)
    `).run(req.admin.id, req.params.id, `Modification : ${nom}`);

    res.json({ message: 'Ingrédient mis à jour', id: parseInt(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : SUPPRIMER UN INGRÉDIENT ----------
app.delete('/api/admin/ingredients/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const ing = db.prepare('SELECT nom FROM ingredients WHERE id = ?').get(req.params.id);
    if (!ing) return res.status(404).json({ erreur: 'Ingrédient introuvable' });

    // Vérifier s'il est utilisé
    const usage = db.prepare('SELECT COUNT(*) as n FROM remede_ingredients WHERE ingredient_id = ?').get(req.params.id);
    if (usage.n > 0) {
      return res.status(409).json({
        erreur: `Cet ingrédient est utilisé dans ${usage.n} remède(s). Retirez-le d'abord.`
      });
    }

    db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'suppression_ingredient', 'ingredient', ?, ?)
    `).run(req.admin.id, req.params.id, `Suppression : ${ing.nom}`);

    res.json({ message: 'Ingrédient supprimé', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});


// ---------- ADMIN : LISTER TOUTES LES INDICATIONS ----------
app.get('/api/admin/indications', requireAuth, (req, res) => {
  try {
    const indications = db.prepare(`
      SELECT ind.*, COUNT(ri.remede_id) as nb_remedes
      FROM indications ind
      LEFT JOIN remede_indications ri ON ri.indication_id = ind.id
      GROUP BY ind.id
      ORDER BY ind.nom ASC
    `).all();
    res.json({ total: indications.length, indications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CRÉER UNE INDICATION ----------
app.post('/api/admin/indications', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const { nom, description, synonymes, type } = req.body;
    if (!nom || !nom.trim()) {
      return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }

    const existant = db.prepare('SELECT id FROM indications WHERE nom = ?').get(nom.trim());
    if (existant) {
      return res.status(409).json({ erreur: 'Cette indication existe déjà' });
    }

    const result = db.prepare(`
      INSERT INTO indications (nom, description, synonymes, type)
      VALUES (?, ?, ?, ?)
    `).run(nom.trim(), description || null, synonymes || null, type || null);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'creation_indication', 'indication', ?, ?)
    `).run(req.admin.id, result.lastInsertRowid, `Création : ${nom}`);

    res.status(201).json({ message: 'Indication créée', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : MODIFIER UNE INDICATION ----------
app.put('/api/admin/indications/:id', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const ind = db.prepare('SELECT id FROM indications WHERE id = ?').get(req.params.id);
    if (!ind) return res.status(404).json({ erreur: 'Indication introuvable' });

    const { nom, description, synonymes, type } = req.body;
    if (!nom || !nom.trim()) {
      return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }

    db.prepare(`
      UPDATE indications SET nom = ?, description = ?, synonymes = ?, type = ?
      WHERE id = ?
    `).run(nom.trim(), description || null, synonymes || null, type || null, req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'modification_indication', 'indication', ?, ?)
    `).run(req.admin.id, req.params.id, `Modification : ${nom}`);

    res.json({ message: 'Indication mise à jour', id: parseInt(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : SUPPRIMER UNE INDICATION ----------
app.delete('/api/admin/indications/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const ind = db.prepare('SELECT nom FROM indications WHERE id = ?').get(req.params.id);
    if (!ind) return res.status(404).json({ erreur: 'Indication introuvable' });

    const usage = db.prepare('SELECT COUNT(*) as n FROM remede_indications WHERE indication_id = ?').get(req.params.id);
    if (usage.n > 0) {
      return res.status(409).json({
        erreur: `Cette indication est utilisée dans ${usage.n} remède(s). Retirez-la d'abord.`
      });
    }

    db.prepare('DELETE FROM indications WHERE id = ?').run(req.params.id);
    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'suppression_indication', 'indication', ?, ?)
    `).run(req.admin.id, req.params.id, `Suppression : ${ind.nom}`);

    res.json({ message: 'Indication supprimée', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : STATISTIQUES COMPLÈTES ----------
app.get('/api/admin/statistics', requireAuth, (req, res) => {
  try {
    // --- Compteurs globaux ---
    const compteurs = {
      remedes: db.prepare('SELECT COUNT(*) as n FROM remedes').get().n,
      remedesPublies: db.prepare("SELECT COUNT(*) as n FROM remedes WHERE statut = 'publie'").get().n,
      remedesAttente: db.prepare("SELECT COUNT(*) as n FROM remedes WHERE statut = 'en_attente'").get().n,
      remedesArchives: db.prepare("SELECT COUNT(*) as n FROM remedes WHERE statut = 'archive'").get().n,
      ingredients: db.prepare('SELECT COUNT(*) as n FROM ingredients').get().n,
      indications: db.prepare('SELECT COUNT(*) as n FROM indications').get().n,
      commentaires: db.prepare('SELECT COUNT(*) as n FROM commentaires').get().n,
      commentairesAttente: db.prepare("SELECT COUNT(*) as n FROM commentaires WHERE statut = 'en_attente'").get().n,
      signalementsNouveaux: db.prepare("SELECT COUNT(*) as n FROM signalements WHERE statut = 'nouveau'").get().n,
      vuesTotales: db.prepare('SELECT COALESCE(SUM(vues), 0) as n FROM remedes').get().n,
      likesTotaux: db.prepare('SELECT COALESCE(SUM(likes), 0) as n FROM remedes').get().n,
    };

    // --- Top 5 remèdes les plus consultés ---
    const topVus = db.prepare(`
      SELECT id, nom_local, region_origine, vues, likes
      FROM remedes
      WHERE statut = 'publie'
      ORDER BY vues DESC
      LIMIT 5
    `).all();

    // --- Top 5 remèdes les plus likés ---
    const topLikes = db.prepare(`
      SELECT id, nom_local, region_origine, vues, likes
      FROM remedes
      WHERE statut = 'publie'
      ORDER BY likes DESC
      LIMIT 5
    `).all();

    // --- Répartition par région ---
    const parRegion = db.prepare(`
      SELECT COALESCE(region_origine, 'Non précisée') as region, COUNT(*) as n
      FROM remedes
      WHERE statut = 'publie'
      GROUP BY region_origine
      ORDER BY n DESC
    `).all();

    // --- Répartition par niveau de fiabilité ---
    const parFiabilite = db.prepare(`
      SELECT niveau_fiabilite as niveau, COUNT(*) as n
      FROM remedes
      WHERE statut = 'publie'
      GROUP BY niveau_fiabilite
      ORDER BY niveau_fiabilite
    `).all();

    // --- Répartition par statut (tous remèdes) ---
    const parStatut = db.prepare(`
      SELECT statut, COUNT(*) as n
      FROM remedes
      GROUP BY statut
    `).all();

    // --- Derniers remèdes ajoutés ---
    const derniers = db.prepare(`
      SELECT id, nom_local, region_origine, statut, date_ajout
      FROM remedes
      ORDER BY date_ajout DESC
      LIMIT 5
    `).all();

    // --- Derniers commentaires publiés ---
    const derniersCommentaires = db.prepare(`
      SELECT c.id, c.pseudonyme, c.contenu, c.date_ajout, r.id as remede_id, r.nom_local as remede_nom
      FROM commentaires c
      JOIN remedes r ON r.id = c.remede_id
      WHERE c.statut = 'publie'
      ORDER BY c.date_ajout DESC
      LIMIT 5
    `).all();

    res.json({
      compteurs,
      topVus,
      topLikes,
      parRegion,
      parFiabilite,
      parStatut,
      derniers,
      derniersCommentaires,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : UPLOADER UN MÉDIA POUR UN REMÈDE ----------
app.post(
  '/api/admin/remedes/:id/media',
  requireAuth,
  requireRole('admin', 'scientifique'),
  upload.single('fichier'),
  (req, res) => {
    try {
      const remede = db.prepare('SELECT id FROM remedes WHERE id = ?').get(req.params.id);
      if (!remede) {
        // Supprimer le fichier orphelin
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ erreur: 'Remède introuvable' });
      }

      if (!req.file) {
        return res.status(400).json({ erreur: 'Aucun fichier reçu' });
      }

      const { titre, description, source, auteur } = req.body;

      // Déterminer le type
      const type = req.file.mimetype.startsWith('video/') ? 'video'
                 : req.file.mimetype === 'application/pdf' ? 'document'
                 : 'image';

      const url = `/uploads/${req.file.filename}`;

      const result = db.prepare(`
        INSERT INTO media (remede_id, type, url, titre, description, source, auteur, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')
      `).run(
        req.params.id, type, url,
        titre || req.file.originalname,
        description || null,
        source || null,
        auteur || null
      );

      db.prepare(`
        INSERT INTO logs (admin_id, action, cible, cible_id, details)
        VALUES (?, 'upload_media', 'media', ?, ?)
      `).run(req.admin.id, result.lastInsertRowid, `Upload : ${req.file.originalname}`);

      res.status(201).json({
        message: 'Média uploadé (en attente de validation)',
        id: result.lastInsertRowid,
        url,
        type,
        taille: req.file.size,
      });
    } catch (err) {
      console.error(err);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ erreur: 'Erreur serveur' });
    }
  }
);

// ---------- ADMIN : LISTER TOUS LES MÉDIAS ----------
app.get('/api/admin/media', requireAuth, (req, res) => {
  try {
    const { statut, remede_id } = req.query;
    let sql = `
      SELECT m.*, r.nom_local as remede_nom
      FROM media m
      LEFT JOIN remedes r ON r.id = m.remede_id
      WHERE 1=1
    `;
    const params = [];

    if (statut) {
      sql += ' AND m.statut = ?';
      params.push(statut);
    }
    if (remede_id) {
      sql += ' AND m.remede_id = ?';
      params.push(remede_id);
    }
    sql += ' ORDER BY m.date_ajout DESC LIMIT 200';

    const medias = db.prepare(sql).all(...params);
    res.json({ total: medias.length, medias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : CHANGER LE STATUT D'UN MÉDIA ----------
app.patch('/api/admin/media/:id/statut', requireAuth, requireRole('admin', 'moderateur'), (req, res) => {
  try {
    const { statut } = req.body;
    const valides = ['en_attente', 'valide', 'rejete'];
    if (!valides.includes(statut)) {
      return res.status(400).json({ erreur: 'Statut invalide' });
    }

    const media = db.prepare('SELECT id FROM media WHERE id = ?').get(req.params.id);
    if (!media) return res.status(404).json({ erreur: 'Média introuvable' });

    db.prepare('UPDATE media SET statut = ? WHERE id = ?').run(statut, req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'changement_statut_media', 'media', ?, ?)
    `).run(req.admin.id, req.params.id, `Nouveau statut : ${statut}`);

    res.json({ message: 'Statut mis à jour', id: req.params.id, statut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- ADMIN : SUPPRIMER UN MÉDIA ----------
app.delete('/api/admin/media/:id', requireAuth, requireRole('admin', 'scientifique'), (req, res) => {
  try {
    const media = db.prepare('SELECT url FROM media WHERE id = ?').get(req.params.id);
    if (!media) return res.status(404).json({ erreur: 'Média introuvable' });

    // Supprimer le fichier physique
    const chemin = path.join(UPLOAD_DIR, path.basename(media.url));
    if (fs.existsSync(chemin)) {
      fs.unlinkSync(chemin);
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);

    db.prepare(`
      INSERT INTO logs (admin_id, action, cible, cible_id, details)
      VALUES (?, 'suppression_media', 'media', ?, ?)
    `).run(req.admin.id, req.params.id, `Suppression : ${media.url}`);

    res.json({ message: 'Média supprimé', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ---------- PUBLIC : MÉDIAS VALIDÉS D'UN REMÈDE ----------
app.get('/api/remedes/:id/media', (req, res) => {
  try {
    const medias = db.prepare(`
      SELECT id, type, url, titre, description, source, auteur
      FROM media
      WHERE remede_id = ? AND statut = 'valide'
      ORDER BY date_ajout ASC
    `).all(req.params.id);

    res.json({ total: medias.length, medias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});


// ---------- DÉMARRAGE ----------
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});