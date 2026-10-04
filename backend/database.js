// database.js — Initialisation de la base SQLite
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chemin du fichier de base de données
const DB_PATH = path.join(__dirname, 'remedes.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Créer la base si elle n'existe pas
const db = new Database(DB_PATH);

// Activer les foreign keys (désactivées par défaut dans SQLite)
db.pragma('foreign_keys = ON');

// Appliquer le schéma
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

console.log('✅ Base de données initialisée :', DB_PATH);

export default db;