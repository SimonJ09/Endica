import db from './database.js';

console.log('🌱 Insertion de données de démo enrichies...\n');

// ============================================
// NETTOYAGE
// ============================================
db.exec(`
  DELETE FROM remede_indications;
  DELETE FROM remede_ingredients;
  DELETE FROM commentaires;
  DELETE FROM likes;
  DELETE FROM media;
  DELETE FROM sources_scientifiques;
  DELETE FROM signalements;
  DELETE FROM remedes;
  DELETE FROM ingredients;
  DELETE FROM indications;
`);

// ============================================
// INGRÉDIENTS
// ============================================
console.log('🧪 Ingrédients...');
const insIng = db.prepare(`
  INSERT INTO ingredients (nom, nom_local, nom_scientifique, partie_utilisee, description)
  VALUES (?, ?, ?, ?, ?)
`);

const ingredients = [
  ['Neem', 'Neem', 'Azadirachta indica', 'Feuille', 'Arbre tropical aux propriétés médicinales reconnues.'],
  ['Gingembre', 'Ataklé', 'Zingiber officinale', 'Rhizome', 'Racine aromatique utilisée pour ses propriétés anti-inflammatoires.'],
  ['Citron', 'Citron', 'Citrus limon', 'Fruit', 'Agrume riche en vitamine C.'],
  ['Aloe vera', 'Aloè', 'Aloe barbadensis', 'Feuille', 'Plante succulente apaisante.'],
  ['Moringa', 'Moringa', 'Moringa oleifera', 'Feuille', 'Arbre aux multiples vertus nutritionnelles.'],
  ['Hibiscus', 'Bissap', 'Hibiscus sabdariffa', 'Fleur', 'Fleur rouge utilisée en infusion.'],
  ['Papaye', 'Igbá', 'Carica papaya', 'Feuille', 'Feuilles riches en enzymes.'],
  ['Ail', 'Ayò', 'Allium sativum', 'Bulbe', 'Bulbe aux propriétés antimicrobiennes.'],
  ['Miel', 'Oyin', 'Mel', 'Produit', 'Produit naturel aux propriétés adoucissantes.'],
  ['Kinkeliba', 'Kinkeliba', 'Combretum micranthum', 'Feuille', 'Plante utilisée pour les fièvres.'],
  ['Basilic', 'Efirin', 'Ocimum gratissimum', 'Feuille', 'Plante aromatique médicinale.'],
  ['Citronnelle', 'Koko', 'Cymbopogon citratus', 'Feuille', 'Herbe aromatique apaisante.'],
  ['Goyave', 'Goyavier', 'Psidium guajava', 'Feuille', 'Feuilles astringentes.'],
  ['Tamarin', 'Tamarindier', 'Tamarindus indica', 'Fruit', 'Fruit acidulé riche en minéraux.'],
  ['Manguier', 'Mangoro', 'Mangifera indica', 'Écorce', 'Écorce aux propriétés astringentes.'],
];

const ingIds = {};
for (const [nom, local, scient, partie, desc] of ingredients) {
  const r = insIng.run(nom, local, scient, partie, desc);
  ingIds[nom] = r.lastInsertRowid;
}
console.log(`  ✅ ${ingredients.length} ingrédients créés\n`);

// ============================================
// INDICATIONS
// ============================================
console.log('📋 Indications...');
const insInd = db.prepare(`
  INSERT INTO indications (nom, synonymes, type, description)
  VALUES (?, ?, ?, ?)
`);

const indications = [
  ['Paludisme', 'Palu, Malaria, Fièvre paludéenne', 'Maladie infectieuse', 'Maladie transmise par les moustiques.'],
  ['Toux', 'Toux sèche, Toux grasse', 'Symptôme', 'Réflexe respiratoire.'],
  ['Fièvre', 'Hyperthermie', 'Symptôme', 'Élévation de la température corporelle.'],
  ['Diarrhée', 'Selles liquides', 'Symptôme', 'Émission fréquente de selles liquides.'],
  ['Blessures', 'Plaies, Coupures, Brûlures', 'Traumatisme', 'Lésions cutanées.'],
  ['Maux de ventre', 'Douleurs abdominales', 'Symptôme', 'Douleurs au niveau de l\'abdomen.'],
  ['Hypertension', 'Tension élevée', 'Maladie chronique', 'Pression artérielle élevée.'],
  ['Diabète', 'Diabète sucré', 'Maladie chronique', 'Trouble de la glycémie.'],
  ['Insomnie', 'Troubles du sommeil', 'Trouble', 'Difficulté à trouver le sommeil.'],
  ['Inflammation', 'Œdème, Rougeur', 'Symptôme', 'Réaction inflammatoire.'],
];

const indIds = {};
for (const [nom, syn, type, desc] of indications) {
  const r = insInd.run(nom, syn, type, desc);
  indIds[nom] = r.lastInsertRowid;
}
console.log(`  ✅ ${indications.length} indications créées\n`);

// ============================================
// REMÈDES
// ============================================
console.log('🌿 Remèdes...');
const insRem = db.prepare(`
  INSERT INTO remedes (
    nom_local, nom_scientifique, description, mode_preparation,
    posologie, region_origine, niveau_fiabilite, statut, ajoute_par, vues, likes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const remedes = [
  {
    nom: 'Tisane de feuilles de Neem',
    scient: 'Azadirachta indica',
    desc: 'Préparation traditionnelle à base de feuilles de neem utilisée pour les fièvres.',
    prep: "Faire bouillir 10 feuilles dans 1L d'eau pendant 10 min. Laisser infuser 5 min. Filtrer avant consommation.",
    poso: 'Information non validée — source traditionnelle disponible',
    region: 'Atlantique',
    niveau: 2,
    ings: ['Neem'],
    inds: ['Paludisme', 'Fièvre'],
  },
  {
    nom: 'Décoction de gingembre et citron',
    scient: 'Zingiber officinale + Citrus limon',
    desc: 'Boisson traditionnelle contre la toux et les refroidissements.',
    prep: 'Râper un morceau de gingembre, ajouter le jus d\'un citron, faire bouillir 5 min dans 500ml d\'eau. Ajouter une cuillère de miel.',
    poso: '2 à 3 tasses par jour (usage traditionnel)',
    region: 'Ouémé',
    niveau: 3,
    ings: ['Gingembre', 'Citron', 'Miel'],
    inds: ['Toux', 'Inflammation'],
  },
  {
    nom: 'Gel d\'Aloe vera',
    scient: 'Aloe barbadensis',
    desc: 'Application locale du gel frais d\'aloe sur les brûlures et plaies.',
    prep: 'Couper une feuille, extraire le gel, appliquer directement sur la zone concernée.',
    poso: 'Application locale 2 fois par jour',
    region: 'Zou',
    niveau: 4,
    ings: ['Aloe vera'],
    inds: ['Blessures', 'Inflammation'],
  },
  {
    nom: 'Infusion de Moringa',
    scient: 'Moringa oleifera',
    desc: 'Tisane nutritive à base de feuilles de moringa, riche en vitamines et minéraux.',
    prep: 'Infuser 5 feuilles fraîches ou 1 c. à café de poudre dans de l\'eau chaude pendant 5 min.',
    poso: '1 à 2 tasses par jour',
    region: 'Plateau',
    niveau: 3,
    ings: ['Moringa'],
    inds: ['Inflammation'],
  },
  {
    nom: 'Jus de bissap (Hibiscus)',
    scient: 'Hibiscus sabdariffa',
    desc: 'Boisson rafraîchissante à base de fleurs d\'hibiscus, utilisée pour la tension.',
    prep: 'Faire bouillir les fleurs séchées dans l\'eau 10 min. Laisser refroidir. Ajouter gingembre et un peu de sucre.',
    poso: '1 à 2 verres par jour',
    region: 'Atlantique',
    niveau: 3,
    ings: ['Hibiscus', 'Gingembre'],
    inds: ['Hypertension'],
  },
  {
    nom: 'Tisane de feuilles de papaye',
    scient: 'Carica papaya',
    desc: 'Infusion traditionnelle utilisée pour soutenir le traitement du paludisme.',
    prep: 'Faire bouillir 5 feuilles fraîches dans 1L d\'eau pendant 15 min. Filtrer.',
    poso: 'Information non validée — source traditionnelle',
    region: 'Mono',
    niveau: 2,
    ings: ['Papaye'],
    inds: ['Paludisme', 'Fièvre'],
  },
  {
    nom: 'Infusion d\'ail et miel',
    scient: 'Allium sativum + Mel',
    desc: 'Préparation traditionnelle pour renforcer les défenses naturelles.',
    prep: 'Écraser 2 gousses d\'ail, mélanger avec 1 c. à soupe de miel. Laisser reposer 10 min.',
    poso: '1 c. à café matin à jeun',
    region: 'Couffo',
    niveau: 2,
    ings: ['Ail', 'Miel'],
    inds: ['Toux', 'Inflammation'],
  },
  {
    nom: 'Tisane de kinkeliba',
    scient: 'Combretum micranthum',
    desc: 'Boisson traditionnelle utilisée contre les fièvres et pour la digestion.',
    prep: 'Infuser 1 poignée de feuilles séchées dans 1L d\'eau bouillante pendant 10 min.',
    poso: '2 à 3 tasses par jour',
    region: 'Borgou',
    niveau: 3,
    ings: ['Kinkeliba'],
    inds: ['Fièvre', 'Paludisme', 'Maux de ventre'],
  },
  {
    nom: 'Décoction de basilic africain',
    scient: 'Ocimum gratissimum',
    desc: 'Utilisée en inhalation et en tisane pour les affections respiratoires.',
    prep: 'Faire bouillir les feuilles dans l\'eau. Utiliser en inhalation ou boire tiède.',
    poso: 'Inhalation 2 fois par jour',
    region: 'Ouémé',
    niveau: 3,
    ings: ['Basilic'],
    inds: ['Toux', 'Fièvre'],
  },
  {
    nom: 'Tisane de citronnelle',
    scient: 'Cymbopogon citratus',
    desc: 'Infusion apaisante favorisant le sommeil et la digestion.',
    prep: 'Infuser quelques brins frais ou séchés dans de l\'eau chaude 5 min.',
    poso: '1 tasse le soir',
    region: 'Atlantique',
    niveau: 3,
    ings: ['Citronnelle'],
    inds: ['Insomnie', 'Maux de ventre'],
  },
  {
    nom: 'Décoction d\'écorce de manguier',
    scient: 'Mangifera indica',
    desc: 'Préparation astringente traditionnelle contre la diarrhée.',
    prep: 'Faire bouillir un morceau d\'écorce dans 1L d\'eau pendant 20 min. Filtrer.',
    poso: '1 verre 2 fois par jour',
    region: 'Zou',
    niveau: 2,
    ings: ['Manguier'],
    inds: ['Diarrhée'],
  },
  {
    nom: 'Infusion de feuilles de goyavier',
    scient: 'Psidium guajava',
    desc: 'Tisane traditionnelle utilisée pour calmer les diarrhées.',
    prep: 'Infuser 5 feuilles fraîches dans de l\'eau bouillante 10 min.',
    poso: '2 tasses par jour',
    region: 'Collines',
    niveau: 3,
    ings: ['Goyave'],
    inds: ['Diarrhée', 'Maux de ventre'],
  },
];

const insRI = db.prepare('INSERT INTO remede_ingredients (remede_id, ingredient_id) VALUES (?, ?)');
const insRInd = db.prepare('INSERT INTO remede_indications (remede_id, indication_id) VALUES (?, ?)');

for (const r of remedes) {
  // vues et likes aléatoires pour rendre le site vivant
  const vues = Math.floor(Math.random() * 200) + 10;
  const likes = Math.floor(Math.random() * 30);

  const res = insRem.run(
    r.nom, r.scient, r.desc, r.prep, r.poso, r.region, r.niveau,
    'publie', 'seed', vues, likes
  );
  const remedeId = res.lastInsertRowid;

  for (const ing of r.ings) insRI.run(remedeId, ingIds[ing]);
  for (const ind of r.inds) insRInd.run(remedeId, indIds[ind]);
}
console.log(`  ✅ ${remedes.length} remèdes créés (publiés)\n`);

// ============================================
// COMMENTAIRES DE DÉMO
// ============================================
console.log('💬 Commentaires...');
const insCom = db.prepare(`
  INSERT INTO commentaires (remede_id, pseudonyme, contenu, statut)
  VALUES (?, ?, ?, ?)
`);

const commentaires = [
  [1, 'Koffi_23', 'Ma grand-mère utilisait cette plante dans notre village pour les fièvres.', 'publie'],
  [1, 'Aminata', 'Très répandu dans le sud du pays, je confirme.', 'publie'],
  [2, 'JeanB', 'Efficace contre la toux, je l\'utilise chaque hiver.', 'publie'],
  [3, 'Mariam_D', 'L\'aloe vera m\'a beaucoup aidée pour une brûlure de cuisine.', 'publie'],
  [5, 'Tunde', 'Le bissap est très courant chez nous pour la tension.', 'publie'],
  [8, 'Rachid', 'Mon père prépare cette tisane tous les matins.', 'publie'],
  [1, 'Anonyme_45', 'Attention à ne pas dépasser la dose recommandée.', 'en_attente'],
  [2, 'Nouveau_visiteur', 'Comment se procurer ces plantes ?', 'en_attente'],
];

for (const [rid, pseudo, contenu, statut] of commentaires) {
  insCom.run(rid, pseudo, contenu, statut);
}
console.log(`  ✅ ${commentaires.length} commentaires créés (6 publiés, 2 en attente)\n`);

// ============================================
// LIKES DE DÉMO
// ============================================
console.log('❤️ Likes...');
const insLike = db.prepare(`
  INSERT OR IGNORE INTO likes (remede_id, fingerprint)
  VALUES (?, ?)
`);

let totalLikes = 0;
for (let rid = 1; rid <= remedes.length; rid++) {
  const nbLikes = Math.floor(Math.random() * 15);
  for (let i = 0; i < nbLikes; i++) {
    insLike.run(rid, `seed-${rid}-${i}`);
    totalLikes++;
  }
}
console.log(`  ✅ ${totalLikes} likes créés\n`);

// ============================================
// RÉSUMÉ
// ============================================
console.log('═══════════════════════════════════════════');
console.log('✅ Base de démo enrichie avec succès !');
console.log('═══════════════════════════════════════════');
console.log(`   🧪 ${ingredients.length} ingrédients`);
console.log(`   📋 ${indications.length} indications`);
console.log(`   🌿 ${remedes.length} remèdes publiés`);
console.log(`   💬 ${commentaires.length} commentaires`);
console.log(`   ❤️ ${totalLikes} likes`);
console.log('═══════════════════════════════════════════\n');