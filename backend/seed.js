import db from './database.js';

console.log('🌱 Insertion de données de démo...');

// Nettoyer (optionnel)
db.exec('DELETE FROM remede_indications; DELETE FROM remede_ingredients; DELETE FROM remedes; DELETE FROM ingredients; DELETE FROM indications;');

// Ingrédients
const insIng = db.prepare('INSERT INTO ingredients (nom, nom_local, nom_scientifique, partie_utilisee) VALUES (?, ?, ?, ?)');
const neemId = insIng.run('Neem', 'Neem', 'Azadirachta indica', 'Feuille').lastInsertRowid;
const gingembreId = insIng.run('Gingembre', 'Ataklé', 'Zingiber officinale', 'Rhizome').lastInsertRowid;
const citronId = insIng.run('Citron', 'Citron', 'Citrus limon', 'Fruit').lastInsertRowid;

// Indications
const insInd = db.prepare('INSERT INTO indications (nom, synonymes, type) VALUES (?, ?, ?)');
const paluId = insInd.run('Paludisme', 'Palu, Malaria', 'Maladie infectieuse').lastInsertRowid;
const touxId = insInd.run('Toux', 'Toux sèche, Toux grasse', 'Symptôme').lastInsertRowid;

// Remèdes
const insRem = db.prepare(`
  INSERT INTO remedes (nom_local, nom_scientifique, description, mode_preparation, region_origine, niveau_fiabilite, statut, ajoute_par)
  VALUES (?, ?, ?, ?, ?, ?, 'publie', 'demo')
`);

const r1 = insRem.run(
  'Tisane de feuilles de Neem',
  'Azadirachta indica',
  'Préparation traditionnelle à base de feuilles de neem pour les fièvres.',
  'Faire bouillir 10 feuilles dans 1L d\'eau pendant 10 min. Laisser infuser.',
  'Atlantique',
  2
).lastInsertRowid;

const r2 = insRem.run(
  'Décoction de gingembre et citron',
  'Zingiber officinale + Citrus limon',
  'Boisson traditionnelle contre la toux et les refroidissements.',
  'Râper le gingembre, ajouter le jus de citron, faire bouillir 5 min.',
  'Ouémé',
  3
).lastInsertRowid;

// Liaisons remède <-> ingrédient
const insRI = db.prepare('INSERT INTO remede_ingredients (remede_id, ingredient_id, quantite, unite) VALUES (?, ?, ?, ?)');
insRI.run(r1, neemId, '10', 'feuilles');
insRI.run(r2, gingembreId, '1', 'morceau');
insRI.run(r2, citronId, '1', 'fruit');

// Liaisons remède <-> indication
const insRInd = db.prepare('INSERT INTO remede_indications (remede_id, indication_id) VALUES (?, ?)');
insRInd.run(r1, paluId);
insRInd.run(r2, touxId);

console.log('✅ Données de démo insérées.');
console.log('   - 3 ingrédients');
console.log('   - 2 indications');
console.log('   - 2 remèdes publiés');