import db from './database.js';

console.log('🌱 Génération de la base massivement...\n');

// ============================================
// NETTOYAGE OPTIONNEL (uniquement les données générées)
// ============================================
console.log('🧹 Nettoyage des anciennes données générées...');
db.exec(`
  DELETE FROM remede_indications WHERE remede_id IN (
    SELECT id FROM remedes WHERE ajoute_par = 'seed_genere'
  );
  DELETE FROM remede_ingredients WHERE remede_id IN (
    SELECT id FROM remedes WHERE ajoute_par = 'seed_genere'
  );
  DELETE FROM remedes WHERE ajoute_par = 'seed_genere';
`);

// ============================================
// INGRÉDIENTS — 50 plantes médicinales réelles
// ============================================
console.log('🧪 Insertion des ingrédients...');

const insIng = db.prepare(`
  INSERT OR IGNORE INTO ingredients (nom, nom_local, nom_scientifique, partie_utilisee, description)
  VALUES (?, ?, ?, ?, ?)
`);

const ingredients = [
  ['Neem', 'Neem', 'Azadirachta indica', 'Feuille', 'Arbre tropical aux propriétés médicinales multiples.'],
  ['Gingembre', 'Ataklé', 'Zingiber officinale', 'Rhizome', 'Racine aromatique anti-inflammatoire.'],
  ['Citron', 'Citron', 'Citrus limon', 'Fruit', 'Agrume riche en vitamine C.'],
  ['Aloe vera', 'Aloè', 'Aloe barbadensis', 'Feuille', 'Plante succulente apaisante.'],
  ['Moringa', 'Moringa', 'Moringa oleifera', 'Feuille', 'Arbre nutritionnel aux multiples vertus.'],
  ['Hibiscus', 'Bissap', 'Hibiscus sabdariffa', 'Fleur', 'Fleur rouge utilisée en infusion.'],
  ['Papaye', 'Igbá', 'Carica papaya', 'Feuille', 'Feuilles riches en enzymes.'],
  ['Ail', 'Ayò', 'Allium sativum', 'Bulbe', 'Bulbe antimicrobien.'],
  ['Miel', 'Oyin', 'Mel', 'Produit', 'Produit naturel adoucissant.'],
  ['Kinkeliba', 'Kinkeliba', 'Combretum micranthum', 'Feuille', 'Plante fébrifuge traditionnelle.'],
  ['Basilic africain', 'Efirin', 'Ocimum gratissimum', 'Feuille', 'Plante aromatique médicinale.'],
  ['Citronnelle', 'Koko', 'Cymbopogon citratus', 'Feuille', 'Herbe aromatique apaisante.'],
  ['Goyavier', 'Goyavier', 'Psidium guajava', 'Feuille', 'Feuilles astringentes.'],
  ['Tamarinier', 'Tamarindier', 'Tamarindus indica', 'Fruit', 'Fruit acidulé riche en minéraux.'],
  ['Manguier', 'Mangoro', 'Mangifera indica', 'Écorce', 'Écorce astringente.'],
  ['Baobab', 'Baobab', 'Adansonia digitata', 'Feuille', 'Arbre africain aux feuilles nutritives.'],
  ['Séné', 'Séné', 'Senna alexandrina', 'Feuille', 'Plante laxative traditionnelle.'],
  ['Verveine', 'Verveine', 'Verbena officinalis', 'Feuille', 'Plante apaisante et digestive.'],
  ['Menthe', 'Menthe', 'Mentha spicata', 'Feuille', 'Plante aromatique rafraîchissante.'],
  ['Persil', 'Persil', 'Petroselinum crispum', 'Feuille', 'Plante diurétique.'],
  ['Thym', 'Thym', 'Thymus vulgaris', 'Feuille', 'Plante antiseptique.'],
  ['Romarin', 'Romarin', 'Rosmarinus officinalis', 'Feuille', 'Plante stimulante.'],
  ['Laurier', 'Laurier', 'Laurus nobilis', 'Feuille', 'Feuille aromatique digestive.'],
  ['Cannelle', 'Cannelle', 'Cinnamomum verum', 'Écorce', 'Écorce chaude stimulante.'],
  ['Clou de girofle', 'Girofle', 'Syzygium aromaticum', 'Bouton floral', 'Bouton antiseptique dentaire.'],
  ['Muscade', 'Muscade', 'Myristica fragrans', 'Noix', 'Noix digestive et stimulante.'],
  ['Poivre noir', 'Poivre', 'Piper nigrum', 'Graine', 'Graine stimulante.'],
  ['Curcuma', 'Curcuma', 'Curcuma longa', 'Rhizome', 'Rhizome anti-inflammatoire.'],
  ['Coriandre', 'Coriandre', 'Coriandrum sativum', 'Feuille', 'Feuille digestive.'],
  ['Fenouil', 'Fenouil', 'Foeniculum vulgare', 'Graine', 'Graine carminative.'],
  ['Anis', 'Anis', 'Pimpinella anisum', 'Graine', 'Graine digestive.'],
  ['Carotte', 'Carotte', 'Daucus carota', 'Racine', 'Racine riche en bêta-carotène.'],
  ['Betterave', 'Betterave', 'Beta vulgaris', 'Racine', 'Racine riche en fer.'],
  ['Épinard', 'Épinard', 'Spinacia oleracea', 'Feuille', 'Feuille riche en fer.'],
  ['Chou', 'Chou', 'Brassica oleracea', 'Feuille', 'Légume riche en vitamines.'],
  ['Oignon', 'Oignon', 'Allium cepa', 'Bulbe', 'Bulbe antiseptique.'],
  ['Échalote', 'Échalote', 'Allium ascalonicum', 'Bulbe', 'Bulbe aromatique.'],
  ['Piment', 'Piment', 'Capsicum frutescens', 'Fruit', 'Fruit stimulant.'],
  ['Aubergine', 'Aubergine', 'Solanum melongena', 'Fruit', 'Légume riche en antioxydants.'],
  ['Tomate', 'Tomate', 'Solanum lycopersicum', 'Fruit', 'Fruit riche en lycopène.'],
  ['Concombre', 'Concombre', 'Cucumis sativus', 'Fruit', 'Fruit hydratant.'],
  ['Pastèque', 'Pastèque', 'Citrullus lanatus', 'Fruit', 'Fruit hydratant et diurétique.'],
  ['Melon', 'Melon', 'Cucumis melo', 'Fruit', 'Fruit rafraîchissant.'],
  ['Ananas', 'Ananas', 'Ananas comosus', 'Fruit', 'Fruit anti-inflammatoire.'],
  ['Mangue', 'Mangue', 'Mangifera indica', 'Fruit', 'Fruit riche en vitamines.'],
  ['Orange', 'Orange', 'Citrus sinensis', 'Fruit', 'Agrume riche en vitamine C.'],
  ['Pamplemousse', 'Pamplemousse', 'Citrus paradisi', 'Fruit', 'Agrume détoxifiant.'],
  ['Mandarine', 'Mandarine', 'Citrus reticulata', 'Fruit', 'Agrume doux.'],
  ['Cacao', 'Cacao', 'Theobroma cacao', 'Graine', 'Graine stimulante.'],
  ['Caféier', 'Caféier', 'Coffea arabica', 'Graine', 'Graine stimulante.'],
];

let ingCount = 0;
const ingIds = {};
for (const [nom, local, scient, partie, desc] of ingredients) {
  const r = insIng.run(nom, local, scient, partie, desc);
  if (r.changes > 0) ingCount++;
  // Récupérer l'ID (existe déjà ou vient d'être créé)
  const row = db.prepare('SELECT id FROM ingredients WHERE nom = ?').get(nom);
  ingIds[nom] = row.id;
}
console.log(`  ✅ ${ingCount} nouveaux ingrédients ajoutés (total : ${Object.keys(ingIds).length})\n`);

// ============================================
// INDICATIONS — 30 catégories
// ============================================
console.log('📋 Insertion des indications...');

const insInd = db.prepare(`
  INSERT OR IGNORE INTO indications (nom, synonymes, type, description)
  VALUES (?, ?, ?, ?)
`);

const indications = [
  ['Paludisme', 'Palu, Malaria, Fièvre paludéenne', 'Maladie infectieuse', 'Maladie transmise par les moustiques.'],
  ['Toux', 'Toux sèche, Toux grasse', 'Symptôme', 'Réflexe respiratoire.'],
  ['Fièvre', 'Hyperthermie', 'Symptôme', 'Élévation de la température corporelle.'],
  ['Diarrhée', 'Selles liquides', 'Symptôme', 'Émission fréquente de selles liquides.'],
  ['Constipation', 'Difficulté à déféquer', 'Symptôme', 'Difficulté à évacuer les selles.'],
  ['Blessures', 'Plaies, Coupures, Brûlures', 'Traumatisme', 'Lésions cutanées.'],
  ['Maux de ventre', 'Douleurs abdominales, Coliques', 'Symptôme', 'Douleurs au niveau de l\'abdomen.'],
  ['Hypertension', 'Tension élevée', 'Maladie chronique', 'Pression artérielle élevée.'],
  ['Diabète', 'Diabète sucré', 'Maladie chronique', 'Trouble de la glycémie.'],
  ['Insomnie', 'Troubles du sommeil', 'Trouble', 'Difficulté à trouver le sommeil.'],
  ['Inflammation', 'Œdème, Rougeur', 'Symptôme', 'Réaction inflammatoire.'],
  ['Rhume', 'Rhinopharyngite', 'Infection virale', 'Infection des voies respiratoires.'],
  ['Grippe', 'Influenza', 'Infection virale', 'Infection virale saisonnière.'],
  ['Angine', 'Mal de gorge', 'Infection', 'Inflammation de la gorge.'],
  ['Asthme', 'Difficultés respiratoires', 'Maladie chronique', 'Trouble respiratoire chronique.'],
  ['Anémie', 'Manque de fer', 'Carence', 'Diminution des globules rouges.'],
  ['Fatigue', 'Asthénie', 'Symptôme', 'Manque d\'énergie général.'],
  ['Migraine', 'Mal de tête', 'Symptôme', 'Douleur intense à la tête.'],
  ['Nausées', 'Vomissements', 'Symptôme', 'Envie de vomir.'],
  ['Indigestion', 'Ballonnements', 'Symptôme', 'Trouble digestif.'],
  ['Ulcère', 'Ulcère gastrique', 'Maladie', 'Lésion de la paroi gastrique.'],
  ['Infection urinaire', 'Cystite', 'Infection', 'Infection des voies urinaires.'],
  ['Prostate', 'Hypertrophie bénigne', 'Maladie', 'Trouble de la prostate.'],
  ['Règles douloureuses', 'Dysménorrhée', 'Symptôme', 'Douleurs menstruelles.'],
  ['Stérilité', 'Difficulté à concevoir', 'Trouble', 'Difficulté à concevoir un enfant.'],
  ['Chute de cheveux', 'Alopécie', 'Symptôme', 'Perte de cheveux.'],
  ['Acné', 'Boutons', 'Symptôme', 'Inflammation de la peau.'],
  ['Mycose', 'Champignons', 'Infection', 'Infection fongique.'],
  ['Piqûre d\'insecte', 'Piqûre, Morsure', 'Traumatisme', 'Réaction à une piqûre.'],
  ['Brûlures d\'estomac', 'Reflux', 'Symptôme', 'Remontées acides.'],
];

let indCount = 0;
const indIds = {};
for (const [nom, syn, type, desc] of indications) {
  const r = insInd.run(nom, syn, type, desc);
  if (r.changes > 0) indCount++;
  const row = db.prepare('SELECT id FROM indications WHERE nom = ?').get(nom);
  indIds[nom] = row.id;
}
console.log(`  ✅ ${indCount} nouvelles indications ajoutées (total : ${Object.keys(indIds).length})\n`);

// ============================================
// GÉNÉRATION DE 60 REMÈDES PLAUSIBLES
// ============================================
console.log('🌿 Génération des remèdes...');

const REGIONS = [
  'Atlantique', 'Ouémé', 'Plateau', 'Zou', 'Collines',
  'Borgou', 'Alibori', 'Atacora', 'Donga', 'Couffo',
  'Mono', 'Littoral',
];

const MODES_PREP = [
  "Faire bouillir {q} dans {v} d'eau pendant {t} minutes. Laisser infuser. Filtrer avant consommation.",
  "Écraser {q}, mélanger avec un peu d'eau tiède. Laisser reposer {t} minutes.",
  "Infuser {q} dans {v} d'eau chaude pendant {t} minutes.",
  "Piler {q}, ajouter à {v} d'eau bouillante. Couvrir et laisser reposer.",
  "Faire macérer {q} dans {v} d'eau pendant une nuit. Filtrer.",
  "Préparer une décoction avec {q} et {v} d'eau. Réduire de moitié à feu doux.",
];

const POSOLOGIES = [
  "1 tasse matin et soir (usage traditionnel rapporté).",
  "2 à 3 tasses par jour selon la tradition orale.",
  "Application locale 2 fois par jour.",
  "1 cuillère à soupe avant les repas.",
  "Information non validée — source traditionnelle orale.",
  "Dose non documentée — consulter un praticien.",
];

// Modèles de remèdes : [ingrédient principal, ingrédients secondaires, indications]
const MODELES = [
  // PALUDISME / FIÈVRE
  ['Neem', ['Citronnelle'], ['Paludisme', 'Fièvre']],
  ['Papaye', ['Citronnelle'], ['Paludisme', 'Fièvre']],
  ['Kinkeliba', ['Citron'], ['Paludisme', 'Fièvre']],
  ['Basilic africain', ['Gingembre'], ['Paludisme', 'Fièvre']],
  ['Séné', ['Citronnelle'], ['Fièvre', 'Constipation']],
  ['Manguier', ['Citron'], ['Paludisme', 'Fièvre']],
  ['Goyavier', ['Citronnelle'], ['Fièvre', 'Diarrhée']],
  ['Verveine', ['Citron'], ['Fièvre', 'Insomnie']],
  ['Neem', ['Gingembre', 'Citron'], ['Paludisme', 'Inflammation']],

  // TOUX / RESPIRATOIRE
  ['Gingembre', ['Citron', 'Miel'], ['Toux', 'Rhume']],
  ['Miel', ['Citron', 'Gingembre'], ['Toux', 'Angine']],
  ['Thym', ['Miel', 'Citron'], ['Toux', 'Grippe']],
  ['Basilic africain', ['Miel'], ['Toux', 'Rhume']],
  ['Citronnelle', ['Miel'], ['Toux', 'Fièvre']],
  ['Menthe', ['Miel'], ['Toux', 'Angine']],
  ['Eucalyptus', ['Miel'], ['Toux', 'Asthme']],
  ['Neem', ['Miel'], ['Toux', 'Asthme']],

  // DIGESTIF
  ['Menthe', ['Citron'], ['Indigestion', 'Nausées']],
  ['Gingembre', ['Citron'], ['Nausées', 'Indigestion']],
  ['Fenouil', ['Anis'], ['Indigestion', 'Ballonnements']],
  ['Coriandre', ['Fenouil'], ['Indigestion', 'Nausées']],
  ['Verveine', ['Menthe'], ['Indigestion', 'Insomnie']],
  ['Laurier', ['Cannelle'], ['Indigestion', 'Inflammation']],
  ['Tamarinier', ['Gingembre'], ['Constipation', 'Indigestion']],
  ['Séné', ['Fenouil'], ['Constipation', 'Ballonnements']],

  // DIARRHÉE / VENTRE
  ['Goyavier', ['Manguier'], ['Diarrhée']],
  ['Manguier', ['Goyavier'], ['Diarrhée']],
  ['Écorce de baobab', ['Miel'], ['Diarrhée', 'Maux de ventre']],
  ['Grenade', ['Miel'], ['Diarrhée']],
  ['Citronnelle', ['Gingembre'], ['Maux de ventre', 'Nausées']],
  ['Basilic africain', ['Citron'], ['Maux de ventre', 'Diarrhée']],

  // INFLAMMATION / DOULEURS
  ['Curcuma', ['Gingembre', 'Poivre noir'], ['Inflammation', 'Maux de ventre']],
  ['Aloe vera', ['Miel'], ['Brûlures', 'Inflammation']],
  ['Gingembre', ['Curcuma'], ['Inflammation', 'Migraine']],
  ['Clou de girofle', ['Gingembre'], ['Migraine', 'Inflammation']],
  ['Menthe', ['Gingembre'], ['Migraine', 'Nausées']],
  ['Neem', ['Curcuma'], ['Inflammation', 'Mycose']],

  // PEAU / BLESSURES
  ['Aloe vera', [], ['Brûlures', 'Blessures']],
  ['Miel', ['Aloe vera'], ['Blessures', 'Brûlures']],
  ['Neem', ['Curcuma'], ['Acné', 'Mycose']],
  ['Aloe vera', ['Miel'], ['Acné', 'Inflammation']],
  ['Citron', ['Miel'], ['Acné', 'Chute de cheveux']],
  ['Moringa', ['Miel'], ['Blessures', 'Inflammation']],

  // CARDIO / MÉTABOLIQUE
  ['Hibiscus', ['Gingembre'], ['Hypertension']],
  ['Ail', ['Citron'], ['Hypertension', 'Inflammation']],
  ['Moringa', ['Citron'], ['Diabète', 'Fatigue']],
  ['Fenugrec', ['Citron'], ['Diabète']],
  ['Cannelle', ['Gingembre'], ['Diabète', 'Indigestion']],
  ['Neem', ['Aloe vera'], ['Diabète', 'Inflammation']],

  // SANG / FÉMININ
  ['Moringa', ['Betterave'], ['Anémie', 'Fatigue']],
  ['Betterave', ['Carotte', 'Orange'], ['Anémie', 'Fatigue']],
  ['Moringa', ['Épinard'], ['Anémie', 'Fatigue']],
  ['Aloe vera', ['Miel'], ['Règles douloureuses', 'Inflammation']],
  ['Persil', ['Citron'], ['Règles douloureuses', 'Anémie']],

  // SOMMEIL / STRESS
  ['Citronnelle', ['Verveine'], ['Insomnie']],
  ['Verveine', ['Menthe'], ['Insomnie', 'Fatigue']],
  ['Basilic africain', ['Citronnelle'], ['Insomnie', 'Migraine']],
];

// Ajouter quelques remèdes supplémentaires pour atteindre 60+
const REMEDES_SUPPL = [
  ['Moringa', ['Miel'], ['Fatigue', 'Inflammation']],
  ['Miel', ['Citron', 'Cannelle'], ['Rhume', 'Angine']],
  ['Ail', ['Miel', 'Citron'], ['Rhume', 'Inflammation']],
  ['Gingembre', ['Cannelle', 'Miel'], ['Grippe', 'Inflammation']],
  ['Tamarinier', ['Gingembre', 'Citron'], ['Constipation', 'Fatigue']],
  ['Manguier', ['Citron'], ['Ulcère', 'Inflammation']],
  ['Aloe vera', ['Citron'], ['Constipation', 'Indigestion']],
  ['Baobab', ['Miel'], ['Anémie', 'Diarrhée']],
  ['Moringa', ['Citron', 'Miel'], ['Anémie', 'Fatigue']],
  ['Persil', ['Citron'], ['Infection urinaire', 'Inflammation']],
];

const TOUS_MODELES = [...MODELES, ...REMEDES_SUPPL];

const insRem = db.prepare(`
  INSERT INTO remedes (
    nom_local, nom_scientifique, description, mode_preparation,
    posologie, region_origine, niveau_fiabilite, statut, ajoute_par
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seed_genere')
`);

const insRI = db.prepare('INSERT OR IGNORE INTO remede_ingredients (remede_id, ingredient_id) VALUES (?, ?)');
const insRInd = db.prepare('INSERT OR IGNORE INTO remede_indications (remede_id, indication_id) VALUES (?, ?)');

let nbRemedes = 0;
for (let i = 0; i < TOUS_MODELES.length; i++) {
  const [principal, secondaires, inds] = TOUS_MODELES[i];
  const autres = secondaires.filter(Boolean);

  // Nom du remède
  const tousIngs = [principal, ...autres];
  const nomLocal = `Préparation à base de ${tousIngs.map(x => x.toLowerCase()).join(' et ')}`;

  // Nom scientifique (récupérer les vrais noms)
  const nomsScientifiques = tousIngs
    .map((n) => {
      const row = db.prepare('SELECT nom_scientifique FROM ingredients WHERE nom = ?').get(n);
      return row?.nom_scientifique;
    })
    .filter(Boolean)
    .join(' + ');

  // Description
  const desc = `Préparation traditionnelle à base de ${tousIngs.join(', ').toLowerCase()}, rapportée pour ${inds.join(' et ').toLowerCase()}.`;

  // Mode de préparation (variation selon modèle)
  const mode = MODES_PREP[i % MODES_PREP.length]
    .replace('{q}', principal.toLowerCase())
    .replace('{v}', '500 ml')
    .replace('{t}', (5 + (i % 10)).toString());

  // Posologie
  const poso = POSOLOGIES[i % POSOLOGIES.length];

  // Région (rotation)
  const region = REGIONS[i % REGIONS.length];

  // Niveau de fiabilité (1-3 pour rester prudent)
  const niveau = 2;

  const res = insRem.run(
    nomLocal, nomsScientifiques, desc, mode, poso, region, niveau, 'en_attente'
  );
  const remedeId = res.lastInsertRowid;

  // Liaisons ingrédients
  for (const nomIng of tousIngs) {
    if (ingIds[nomIng]) {
      insRI.run(remedeId, ingIds[nomIng]);
    }
  }

  // Liaisons indications
  for (const nomInd of inds) {
    if (indIds[nomInd]) {
      insRInd.run(remedeId, indIds[nomInd]);
    }
  }

  nbRemedes++;
}

console.log(`  ✅ ${nbRemedes} remèdes générés (statut : en_attente)\n`);

// ============================================
// RÉSUMÉ
// ============================================
console.log('═══════════════════════════════════════════');
console.log('✅ Génération terminée !');
console.log('═══════════════════════════════════════════');
console.log(`   🧪 Ingrédients : ${Object.keys(ingIds).length}`);
console.log(`   📋 Indications : ${Object.keys(indIds).length}`);
console.log(`   🌿 Remèdes     : ${nbRemedes}`);
console.log('');
console.log('⚠️  IMPORTANT : tous les remèdes sont en "en_attente".');
console.log('   Va dans /admin/remedes pour les vérifier et publier.');
console.log('   Filtre : statut = en_attente');
console.log('═══════════════════════════════════════════\n');