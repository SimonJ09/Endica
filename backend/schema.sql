-- ============================================
-- REMÈDES DU TERROIR — SCHÉMA DE BASE
-- ============================================

PRAGMA foreign_keys = ON;

-- ---------- REMÈDES ----------
CREATE TABLE IF NOT EXISTS remedes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_local TEXT NOT NULL,
  nom_scientifique TEXT,
  description TEXT,
  mode_preparation TEXT,
  posologie TEXT,
  region_origine TEXT,
  niveau_fiabilite INTEGER DEFAULT 1,  -- 1 à 5
  statut TEXT DEFAULT 'en_attente',    -- en_attente | publie | rejete | archive
  vues INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  ajoute_par TEXT,
  modifie_par TEXT,
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- INGREDIENTS ----------
CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  nom_local TEXT,
  nom_scientifique TEXT,
  description TEXT,
  partie_utilisee TEXT,
  source TEXT,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- LIAISON REMEDE <-> INGREDIENT ----------
CREATE TABLE IF NOT EXISTS remede_ingredients (
  remede_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantite TEXT,
  unite TEXT,
  ordre INTEGER DEFAULT 0,
  PRIMARY KEY (remede_id, ingredient_id),
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- ---------- INDICATIONS ----------
CREATE TABLE IF NOT EXISTS indications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  synonymes TEXT,
  type TEXT
);

-- ---------- LIAISON REMEDE <-> INDICATION ----------
CREATE TABLE IF NOT EXISTS remede_indications (
  remede_id INTEGER NOT NULL,
  indication_id INTEGER NOT NULL,
  PRIMARY KEY (remede_id, indication_id),
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE,
  FOREIGN KEY (indication_id) REFERENCES indications(id) ON DELETE CASCADE
);

-- ---------- MEDIAS (photos/vidéos) ----------
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remede_id INTEGER,
  type TEXT NOT NULL,                 -- image | video
  url TEXT NOT NULL,
  titre TEXT,
  description TEXT,
  source TEXT,
  auteur TEXT,
  statut TEXT DEFAULT 'en_attente',
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE
);

-- ---------- SOURCES SCIENTIFIQUES ----------
CREATE TABLE IF NOT EXISTS sources_scientifiques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remede_id INTEGER,
  titre TEXT NOT NULL,
  auteurs TEXT,
  annee INTEGER,
  revue TEXT,
  doi TEXT,
  url TEXT,
  resume TEXT,
  fichier_pdf TEXT,
  type TEXT,                          -- article | these | rapport | ouvrage
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE
);

-- ---------- COMMENTAIRES ----------
CREATE TABLE IF NOT EXISTS commentaires (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remede_id INTEGER NOT NULL,
  pseudonyme TEXT NOT NULL,
  contenu TEXT NOT NULL,
  statut TEXT DEFAULT 'en_attente',   -- en_attente | publie | rejete | masque
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE
);

-- ---------- SIGNALEMENTS ----------
CREATE TABLE IF NOT EXISTS signalements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_cible TEXT NOT NULL,           -- commentaire | remede | media | source
  cible_id INTEGER NOT NULL,
  motif TEXT NOT NULL,
  details TEXT,
  statut TEXT DEFAULT 'nouveau',      -- nouveau | traite | rejete
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- ADMINISTRATEURS ----------
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe_hash TEXT NOT NULL,
  nom TEXT,
  role TEXT DEFAULT 'admin',          -- admin | moderateur | scientifique
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- JOURNAL D'ACTIVITÉ ----------
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  action TEXT NOT NULL,
  cible TEXT,
  cible_id INTEGER,
  details TEXT,
  date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remede_id INTEGER NOT NULL,
  fingerprint TEXT NOT NULL,
  date_like DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(remede_id, fingerprint),
  FOREIGN KEY (remede_id) REFERENCES remedes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_likes_remede ON likes(remede_id);

-- ---------- INDEX (pour la performance) ----------
CREATE INDEX IF NOT EXISTS idx_remedes_statut ON remedes(statut);
CREATE INDEX IF NOT EXISTS idx_remedes_nom_local ON remedes(nom_local);
CREATE INDEX IF NOT EXISTS idx_ingredients_nom ON ingredients(nom);
CREATE INDEX IF NOT EXISTS idx_indications_nom ON indications(nom);
CREATE INDEX IF NOT EXISTS idx_commentaires_remede ON commentaires(remede_id);