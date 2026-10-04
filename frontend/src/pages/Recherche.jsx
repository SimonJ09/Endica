import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

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

export default function Recherche() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [resultats, setResultats] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!q) return;
    setChargement(true);
    setErreur(null);
    api.get('/recherche', { params: { q } })
      .then((res) => setResultats(res.data))
      .catch((err) => {
        console.error(err);
        setErreur('Erreur lors de la recherche.');
      })
      .finally(() => setChargement(false));
  }, [q]);

  return (
    <div className="container">
      <h2 style={{ marginTop: '1.5rem', color: 'var(--vert-fonce)' }}>
        🔍 Résultats pour « {q} »
      </h2>

      {chargement && <p className="chargement">Recherche…</p>}
      {erreur && <div className="erreur">{erreur}</div>}

      {resultats && (
        <>
          <p style={{ color: 'var(--texte-doux)', marginTop: '0.5rem' }}>
            {resultats.total} résultat{resultats.total > 1 ? 's' : ''}
          </p>

          {/* REMÈDES */}
          {resultats.remedes.length > 0 && (
            <section className="section">
              <h2>🌿 Remèdes ({resultats.remedes.length})</h2>
              <div className="grille">
                {resultats.remedes.map((r) => (
                  <Link to={`/remedes/${r.id}`} key={r.id} className="carte">
                    <h3>{r.nom_local}</h3>
                    {r.nom_scientifique && <p className="scientifique">{r.nom_scientifique}</p>}
                    <BadgeFiabilite niveau={r.niveau_fiabilite} />
                    <div className="meta">
                      <span>📍 {r.region_origine || '—'}</span>
                      <span>👁 {r.vues} · ❤️ {r.likes}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* INGRÉDIENTS */}
          {resultats.ingredients.length > 0 && (
            <section className="section">
              <h2>🧪 Ingrédients ({resultats.ingredients.length})</h2>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {resultats.ingredients.map((ing) => (
                  <li key={ing.id} style={{ marginBottom: '0.4rem' }}>
                    <strong>{ing.nom}</strong>
                    {ing.nom_scientifique && <em> ({ing.nom_scientifique})</em>}
                    {ing.partie_utilisee && <> — {ing.partie_utilisee}</>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* INDICATIONS */}
          {resultats.indications.length > 0 && (
            <section className="section">
              <h2>📋 Indications ({resultats.indications.length})</h2>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {resultats.indications.map((ind) => (
                  <li key={ind.id} style={{ marginBottom: '0.4rem' }}>
                    <strong>{ind.nom}</strong>
                    {ind.synonymes && <span style={{ color: 'var(--texte-doux)' }}> ({ind.synonymes})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resultats.total === 0 && (
            <p className="vide">Aucun résultat pour cette recherche.</p>
          )}
        </>
      )}
    </div>
  );
}