// create-admin.js — Créer un compte administrateur
import bcrypt from 'bcryptjs';
import readline from 'readline';
import db from './database.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

async function main() {
  console.log('=== Création d\'un administrateur ===\n');

  const email = (await question('Email : ')).trim().toLowerCase();
  const nom = (await question('Nom : ')).trim();
  const motDePasse = await question('Mot de passe (min 8 caractères) : ');
  const role = (await question('Rôle [admin/moderateur/scientifique] (admin par défaut) : ')).trim() || 'admin';

  if (!email || !motDePasse) {
    console.error('❌ Email et mot de passe obligatoires.');
    process.exit(1);
  }

  if (motDePasse.length < 8) {
    console.error('❌ Mot de passe trop court (min 8 caractères).');
    process.exit(1);
  }

  const existant = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (existant) {
    console.error('❌ Un admin avec cet email existe déjà.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(motDePasse, 12);

  const result = db.prepare(`
    INSERT INTO admins (email, mot_de_passe_hash, nom, role)
    VALUES (?, ?, ?, ?)
  `).run(email, hash, nom, role);

  console.log(`\n✅ Admin créé (id=${result.lastInsertRowid})`);
  console.log(`   Email : ${email}`);
  console.log(`   Rôle  : ${role}`);

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});