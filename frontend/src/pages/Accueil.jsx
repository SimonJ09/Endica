import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Avertissement from '../components/Avertissement';

/* ---------- ILLUSTRATION HERO ---------- */
const imgHero = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8f5e9"/>
      <stop offset="1" stop-color="#c8e6c9"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#g)"/>
  <g opacity="0.5" fill="none" stroke="#2e7d32" stroke-width="2">
    <path d="M80 340 C 120 240, 180 200, 260 160"/>
    <path d="M260 160 C 240 140, 220 130, 200 130 C 210 150, 230 165, 260 160 Z" fill="#66bb6a"/>
    <path d="M260 160 C 280 140, 300 130, 320 130 C 310 150, 290 165, 260 160 Z" fill="#81c784"/>
    <path d="M420 340 C 400 260, 380 220, 340 180"/>
    <path d="M340 180 C 360 165, 380 158, 400 158 C 390 178, 370 190, 340 180 Z" fill="#81c784"/>
  </g>
</svg>
`)}`;

/* ---------- CITATIONS ---------- */
const CITATIONS = [
  {
    texte:
      "Un peuple sans mémoire est un peuple sans avenir. Chaque plante, chaque préparation, chaque geste transmis est une page de notre histoire.",
    auteur: "Proverbe africain",
  },
  {
    texte:
      "La connaissance qui n'est pas transmise meurt avec celui qui la détient.",
    auteur: "Amadou Hampâté Bâ",
  },
  {
    texte:
      "Ce n'est pas parce qu'un savoir est ancien qu'il est faux, ni parce qu'il est nouveau qu'il est vrai. C'est la preuve qui tranche.",
    auteur: "Principe du projet",
  },
];

/* ---------- 3 PILIERS ÉDITORIAUX ---------- */
const PILIERS = [
  {
    emoji: '📚',
    titre: 'Documenter',
    texte:
      "Rassembler, structurer et conserver les connaissances dispersées sur les remèdes endogènes et les plantes médicinales.",
  },
  {
    emoji: '⚖️',
    titre: 'Distinguer',
    texte:
      "Séparer clairement ce qui relève du témoignage, de la littérature ou de la preuve scientifique. Aucune confusion.",
  },
  {
    emoji: '🌍',
    titre: 'Transmettre',
    texte:
      "Rendre ces savoirs accessibles à tous — publics, étudiants, chercheurs, praticiens — sans jamais encourager l'automédication.",
  },
];

export default function Accueil() {
  const [recherche, setRecherche] = useState('');
  const [citationIndex] = useState(() =>
    Math.floor(Math.random() * CITATIONS.length)
  );
  const navigate = useNavigate();

  const lancerRecherche = (e) => {
    e.preventDefault();
    if (recherche.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(recherche.trim())}`);
    }
  };

  const citation = CITATIONS[citationIndex];

  return (
    <div className="accueil-page">
      {/* ---------- HERO ---------- */}
      <section className="accueil-hero">
        <img
          src={imgHero}
          alt=""
          aria-hidden="true"
          className="accueil-hero-bg"
        />
        <div className="container accueil-hero-content">
          <span className="accueil-eyebrow">🌿 Base documentaire publique</span>
          <h1>
            Les remèdes de nos terroirs,
            <br />
            <span className="accent">documentés</span> avec rigueur.
          </h1>
          <p className="accueil-lead">
            Une plateforme qui rassemble les connaissances sur les remèdes
            endogènes et les plantes médicinales — pour les conserver,
            les comprendre et les transmettre.
          </p>

          <form className="accueil-recherche" onSubmit={lancerRecherche}>
            <input
              type="text"
              placeholder="Rechercher un remède, une plante, une indication…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              aria-label="Recherche"
            />
            <button type="submit" aria-label="Rechercher">🔍</button>
          </form>

          <div className="accueil-hero-liens">
            <Link to="/recherche" className="btn secondaire">
              Explorer la base
            </Link>
            <Link to="/a-propos" className="btn-lien-simple">
              En savoir plus →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CITATION ---------- */}
      <section className="accueil-citation">
        <div className="container accueil-narrow">
          <blockquote>
            <span className="guillemet">«</span>
            {citation.texte}
            <span className="guillemet">»</span>
          </blockquote>
          <cite>— {citation.auteur}</cite>
        </div>
      </section>

      {/* ---------- POURQUOI CE PROJET ---------- */}
      <section className="accueil-section">
        <div className="container accueil-narrow">
          <h2 className="accueil-h2">Pourquoi ce projet ?</h2>
          <p className="accueil-para">
            Dans les villages, dans les familles, se transmet depuis des
            générations un savoir précieux sur les plantes et les préparations
            qui soignent. Mais ce savoir s'efface : les anciens disparaissent,
            les jeunes s'éloignent, et les rares documents restent dispersés.
          </p>
          <p className="accueil-para">
            <strong>Remèdes du terroir</strong> est né de ce constat : offrir
            un lieu unique où ces connaissances peuvent être conservées,
            structurées et consultées — sans jamais tomber dans le piège de
            l'automédication ou de la promesse thérapeutique.
          </p>
        </div>
      </section>

      {/* ---------- 3 PILIERS ---------- */}
      <section className="accueil-section-alt">
        <div className="container">
          <h2 className="accueil-h2 center">Notre approche</h2>
          <p className="accueil-sub center">
            Trois principes guident chaque information publiée.
          </p>
          <div className="accueil-piliers">
            {PILIERS.map((p, i) => (
              <div key={i} className="accueil-pilier">
                <div className="accueil-pilier-emoji">{p.emoji}</div>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- AVERTISSEMENT COURT ---------- */}
      <section className="accueil-section">
        <div className="container accueil-narrow">
          <Avertissement compact />
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="accueil-section-alt">
        <div className="container accueil-narrow center">
          <h2 className="accueil-h2 center">Découvrir la base</h2>
          <p className="accueil-sub center">
            Consultez les remèdes documentés, explorez-les par indication,
            par ingrédient ou par région.
          </p>
          <div className="accueil-cta-actions">
            <Link to="/recherche" className="btn">🔍 Explorer la base</Link>
            <Link to="/a-propos" className="btn secondaire">📄 Le projet</Link>
            <Link to="/equipe" className="btn secondaire">👥 L'équipe</Link>
          </div>
        </div>
      </section>
    </div>
  );
}