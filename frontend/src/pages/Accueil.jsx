import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Avertissement from '../components/Avertissement';

function BadgeFiabilite({ niveau }) {
  const labels = {
    1: 'Non vérifié',
    2: 'Témoignage',
    3: 'Documenté',
    4: 'Données scientifiques',
    5: 'Validation scientifique',
  };
  return <span className={`badge n${niveau}`}>{labels[niveau] || 'N/A'}</span>;
}

export default function Accueil() {
  const [remedes, setRemedes] = useState([]);
  const [stats, setStats] = useState({ remedes: 0, ingredients: 0, indications: 0 });
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/remedes'),
      api.get('/ingredients'),
      api.get('/indications'),
    ])
      .then(([resR, resI, resInd]) => {
        setRemedes(resR.data.remedes);
        setStats({
          remedes: resR.data.total,
          ingredients: resI.data.total,
          indications: resInd.data.total,
        });
      })
      .finally(() => setChargement(false));
  }, []);

  const lancerRecherche = (e) => {
    e.preventDefault();
    if (recherche.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(recherche.trim())}`);
    }
  };

  return (
    <div className="container">
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-badge">🌿 Base documentaire publique</div>
        <h2>Remèdes du terroir</h2>
        <p className="hero-sous-titre">
          Une base de données documentaire qui centralise les connaissances
          sur les remèdes endogènes et les plantes médicinales.
        </p>

        <form className="barre-recherche" onSubmit={lancerRecherche}>
          <input
            type="text"
            placeholder="Rechercher un remède, un ingrédient, une indication…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            aria-label="Recherche"
          />
          <button type="submit">🔍 Rechercher</button>
        </form>

        <div className="hero-stats">
          <div>
            <strong>{stats.remedes}</strong>
            <span>remèdes</span>
          </div>
          <div>
            <strong>{stats.ingredients}</strong>
            <span>ingrédients</span>
          </div>
          <div>
            <strong>{stats.indications}</strong>
            <span>indications</span>
          </div>
        </div>
      </section>

      {/* ---------- AVERTISSEMENT ---------- */}
      <Avertissement />

      {/* ---------- COMMENT ÇA MARCHE ---------- */}
      <section className="section">
        <h2>Comment ça marche ?</h2>
        <div className="grille-3">
          <div className="carte-info">
            <div className="carte-emoji">🔍</div>
            <h3>Rechercher</h3>
            <p>
              Explorez par remède, ingrédient, indication ou région.
              Retrouvez rapidement les informations qui vous intéressent.
            </p>
          </div>
          <div className="carte-info">
            <div className="carte-emoji">📚</div>
            <h3>Documenter</h3>
            <p>
              Chaque information est associée à sa source, son niveau de
              fiabilité et son contexte géographique.
            </p>
          </div>
          <div className="carte-info">
            <div className="carte-emoji">⚖️</div>
            <h3>Distinguer</h3>
            <p>
              Témoignage, littérature, données scientifiques : chaque niveau
              est clairement affiché pour éviter toute confusion.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- NIVEAUX DE FIABILITÉ ---------- */}
      <section className="section">
        <h2>Niveaux de fiabilité</h2>
        <p style={{ color: 'var(--texte-doux)', marginBottom: '1rem' }}>
          Chaque remède est classé selon le degré de documentation disponible.
        </p>
        <div className="niveaux-grille">
          {[
            { n: 1, titre: 'Non vérifié', desc: 'Information enregistrée mais non vérifiée.' },
            { n: 2, titre: 'Témoignage', desc: 'Transmission traditionnelle ou récit rapporté.' },
            { n: 3, titre: 'Documenté', desc: 'Présent dans des publications ou documents.' },
            { n: 4, titre: 'Données scientifiques', desc: 'Études et données disponibles.' },
            { n: 5, titre: 'Validation scientifique', desc: 'Évalué selon les critères du projet.' },
          ].map((niv) => (
            <div key={niv.n} className={`niveau-carte n${niv.n}`}>
              <div className="niveau-num">{niv.n}</div>
              <div>
                <strong>{niv.titre}</strong>
                <p>{niv.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/a-propos">→ En savoir plus sur la méthodologie</Link>
        </p>
      </section>

      {/* ---------- DERNIERS REMÈDES ---------- */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, border: 'none', paddingBottom: 0 }}>Derniers remèdes documentés</h2>
          <Link to="/recherche?q=" style={{ fontSize: '0.9rem' }}>
            Voir la base →
          </Link>
        </div>

        {chargement && <p className="chargement">Chargement…</p>}

        {!chargement && remedes.length === 0 && (
          <p className="vide">Aucun remède publié pour le moment.</p>
        )}

        <div className="grille">
          {remedes.map((r) => (
            <Link to={`/remedes/${r.id}`} key={r.id} className="carte">
              <h3>{r.nom_local}</h3>
              {r.nom_scientifique && (
                <p className="scientifique">{r.nom_scientifique}</p>
              )}
              <BadgeFiabilite niveau={r.niveau_fiabilite} />
              <div className="meta">
                <span>📍 {r.region_origine || 'Région non précisée'}</span>
                <span>👁 {r.vues} · ❤️ {r.likes}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- APPEL À L'ACTION ---------- */}
      <section className="section cta-section">
        <h2 style={{ border: 'none' }}>Découvrir le projet</h2>
        <p style={{ color: 'var(--texte-doux)', marginBottom: '1.2rem' }}>
          En savoir plus sur la vision, les objectifs et l'équipe derrière
          cette base documentaire.
        </p>
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <Link to="/a-propos" className="btn">📄 À propos du projet</Link>
          <Link to="/equipe" className="btn secondaire">👥 Voir l'équipe</Link>
        </div>
      </section>
    </div>
  );
}