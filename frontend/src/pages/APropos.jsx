import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Avertissement from '../components/Avertissement';

const NIVEAUX = [
  {
    n: 1,
    titre: 'Non vérifié',
    desc: "Information enregistrée mais non vérifiée.",
    exemple: "Un remède cité sans source identifiée.",
  },
  {
    n: 2,
    titre: 'Témoignage',
    desc: "Information provenant d'un témoignage ou d'une transmission traditionnelle.",
    exemple: "« Ma grand-mère utilisait cette plante. »",
  },
  {
    n: 3,
    titre: 'Documenté',
    desc: "Information retrouvée dans des documents ou publications.",
    exemple: "Mention dans un ouvrage d'ethnobotanique.",
  },
  {
    n: 4,
    titre: 'Données scientifiques',
    desc: "Des données scientifiques existent et sont documentées.",
    exemple: "Étude publiée sur les propriétés de la plante.",
  },
  {
    n: 5,
    titre: 'Validation scientifique',
    desc: "L'équipe scientifique du projet a identifié des éléments permettant de considérer l'information comme scientifiquement validée.",
    exemple: "Consensus scientifique sur l'efficacité documentée.",
  },
];

const PILIERS = [
  {
    emoji: '📚',
    titre: 'Documenter',
    texte:
      "Centraliser les connaissances dispersées sur les remèdes endogènes : remèdes, plantes, indications, régions, modes de préparation, sources.",
  },
  {
    emoji: '⚖️',
    titre: 'Distinguer',
    texte:
      "Séparer clairement ce qui relève du témoignage, de la littérature ou de la preuve scientifique. Un niveau de fiabilité est affiché pour chaque information.",
  },
  {
    emoji: '🌍',
    titre: 'Transmettre',
    texte:
      "Rendre ces savoirs accessibles au public, aux étudiants, aux chercheurs et aux praticiens, sans jamais les dénaturer ni laisser croire à une prescription médicale.",
  },
];

export default function APropos() {
  const [stats, setStats] = useState({ remedes: 0, ingredients: 0, indications: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/remedes'),
      api.get('/ingredients'),
      api.get('/indications'),
    ]).then(([r, i, ind]) => {
      setStats({
        remedes: r.data.total,
        ingredients: i.data.total,
        indications: ind.data.total,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="apropos-page">
      {/* ---------- HERO ---------- */}
      <section className="apropos-hero">
        <div className="container">
          <span className="apropos-eyebrow">🌿 À propos du projet</span>
          <h1>
            Préserver un savoir <span className="accent">millénaire</span>,
            <br />
            le transmettre <span className="accent">avec rigueur</span>.
          </h1>
          <p className="apropos-lead">
            Remèdes du terroir est une base documentaire publique qui rassemble
            les connaissances sur les remèdes endogènes et les plantes médicinales.
            Un outil pour conserver, comprendre et transmettre — sans jamais
            confondre tradition et preuve scientifique.
          </p>
          <div className="apropos-hero-actions">
            <Link to="/recherche" className="btn">🔍 Explorer la base</Link>
            <Link to="/equipe" className="btn secondaire">👥 Rencontrer l'équipe</Link>
          </div>

          <div className="apropos-stats">
            <div>
              <strong>{stats.remedes}</strong>
              <span>remèdes documentés</span>
            </div>
            <div>
              <strong>{stats.ingredients}</strong>
              <span>ingrédients référencés</span>
            </div>
            <div>
              <strong>{stats.indications}</strong>
              <span>indications rapportées</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- POURQUOI ---------- */}
      <section className="section">
        <div className="container apropos-narrow">
          <h2 className="apropos-h2">Pourquoi ce projet ?</h2>
          <div className="apropos-texte">
            <p>
              Dans les villages, dans les familles, dans les marchés, circule
              depuis des générations un savoir précieux sur les plantes et les
              préparations qui soignent. Ce savoir se transmet oralement, souvent
              sans trace écrite.
            </p>
            <p>
              Mais aujourd'hui, il se perd. Les anciens disparaissent, les jeunes
              s'éloignent, et les quelques documents existants restent dispersés,
              difficiles d'accès, ou noyés dans des affirmations non vérifiées.
            </p>
            <p>
              <strong>Remèdes du terroir</strong> est né de ce constat : offrir
              un lieu unique où ces connaissances peuvent être <strong>conservées</strong>,
              <strong> structurées</strong> et <strong>consultées</strong> — sans
              jamais tomber dans le piège de l'automédication ou de la promesse
              thérapeutique.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- 3 PILIERS ---------- */}
      <section className="section apropos-section-alt">
        <div className="container">
          <h2 className="apropos-h2 center">Notre approche</h2>
          <p className="apropos-sub center">
            Trois principes guident chaque information publiée sur la plateforme.
          </p>
          <div className="piliers-grille">
            {PILIERS.map((p, i) => (
              <div key={i} className="pilier-carte">
                <div className="pilier-emoji">{p.emoji}</div>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CE QUE CE SITE N'EST PAS ---------- */}
      <section className="section">
        <div className="container apropos-narrow">
          <div className="apropos-attention">
            <div className="apropos-attention-header">
              <span className="apropos-attention-icon">⚠️</span>
              <h2>Ce que ce site n'est pas</h2>
            </div>
            <p>
              <strong>Remèdes du terroir n'est pas un service médical.</strong>
            </p>
            <ul className="apropos-liste">
              <li>❌ Ce n'est pas un outil de diagnostic.</li>
              <li>❌ Ce n'est pas un outil de prescription.</li>
              <li>❌ Ce n'est pas un substitut à une consultation médicale.</li>
              <li>❌ Ce n'est pas une garantie d'efficacité ou d'innocuité.</li>
            </ul>
            <p style={{ marginTop: '0.8rem' }}>
              La présence d'un remède dans la base signifie simplement qu'il
              a été <strong>rapporté</strong>, <strong>documenté</strong> ou
              <strong> étudié</strong>. En cas de problème de santé, consultez
              un professionnel qualifié.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- NIVEAUX DE FIABILITÉ ---------- */}
      <section className="section apropos-section-alt">
        <div className="container">
          <h2 className="apropos-h2 center">Les 5 niveaux de fiabilité</h2>
          <p className="apropos-sub center">
            Chaque information est associée à un niveau clairement affiché,
            pour éviter toute confusion entre témoignage et preuve scientifique.
          </p>

          <div className="niveaux-escalier">
            {NIVEAUX.map((niv) => (
              <div key={niv.n} className={`niveau-ligne n${niv.n}`}>
                <div className="niveau-badge">
                  <span className="niveau-chiffre">{niv.n}</span>
                </div>
                <div className="niveau-contenu">
                  <strong>{niv.titre}</strong>
                  <p>{niv.desc}</p>
                  <div className="niveau-exemple">
                    <em>Exemple : {niv.exemple}</em>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SOURCES & TRAÇABILITÉ ---------- */}
      <section className="section">
        <div className="container apropos-narrow">
          <h2 className="apropos-h2">Sources et traçabilité</h2>
          <ul className="apropos-liste-puces">
            <li>
              <strong>Chaque information importante</strong> est associée à sa
              source lorsque celle-ci est connue.
            </li>
            <li>
              <strong>Les modifications sont enregistrées</strong> et tracées
              dans un journal d'activité.
            </li>
            <li>
              <strong>Les publications scientifiques</strong>, documents et
              médias sont référencés avec leurs auteurs et leurs droits.
            </li>
            <li>
              <strong>Un système de signalement</strong> permet à tout
              utilisateur de nous alerter sur une information incorrecte ou
              dangereuse.
            </li>
            <li>
              <strong>Les commentaires sont modérés</strong> avant publication,
              pour préserver la qualité et la sécurité des échanges.
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- CONTRIBUER ---------- */}
      <section className="section apropos-contribuer">
        <div className="container apropos-narrow center">
          <h2 className="apropos-h2">Contribuer au projet</h2>
          <p className="apropos-sub">
            Vous connaissez un remède transmis dans votre famille ? Vous avez
            des photos, des documents, des sources ? Vous êtes chercheur,
            praticien, étudiant, traducteur ?
          </p>
          <p className="apropos-sub" style={{ marginTop: '0.6rem' }}>
            Ce projet se construit <strong>avec</strong> les communautés, pas
            à leur place. Toute contribution est bienvenue.
          </p>
          <div className="apropos-hero-actions" style={{ marginTop: '1.5rem' }}>
            <a href="mailto:judeagohoundje@gmail.com?subject=Contact%20-%20Rem%C3%A8des%20du%20terroir" className="btn">
              ✉️ Nous écrire
            </a>
            <Link to="/equipe" className="btn secondaire">
              👥 Voir l'équipe
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- AVERTISSEMENT COMPLET ---------- */}
      <section className="section">
        <div className="container apropos-narrow">
          <Avertissement />
        </div>
      </section>
    </div>
  );
}