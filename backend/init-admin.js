import bcrypt from 'bcryptjs';
import db from './database.js';

const EMAIL = process.env.ADMIN_EMAIL || 'judeagohoundje@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD;
const NOM = process.env.ADMIN_NOM || 'Admin';

async function initAdmin() {
  if (!PASSWORD) {
    console.log('⚠️ ADMIN_PASSWORD non défini, pas de création d\'admin.');
    return;
  }

  const existant = db.prepare('SELECT id FROM admins WHERE email = ?').get(EMAIL);
  if (existant) {
    console.log('✅ Admin déjà existant.');
    return;
  }

  const hash = await bcrypt.hash(PASSWORD, 12);
  db.prepare(`
    INSERT INTO admins (email, mot_de_passe_hash, nom, role)
    VALUES (?, ?, ?, 'admin')
  `).run(EMAIL, hash, NOM);

  console.log(`✅ Admin créé : ${EMAIL}`);
}

initAdmin().catch(console.error);