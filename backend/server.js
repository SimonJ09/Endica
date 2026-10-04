// server.js — Serveur principal
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARES ----------
app.use(cors());
app.use(express.json());

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

// ---------- DÉMARRAGE ----------
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});