import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function FicheIndication() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    api.get(`/indications/${id}/remedes`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setErreur('Impossible de charger cette indication.');
      })
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <div className="container chargement">Chargement…</div>;
  if (erreur) return <div className="container erreur">{erreur}</div>;
  if (!data) return null;

  const { indication, remedes, message } = data;

  return (
    <div className="container">
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Retour à l'accueil
      </Link>

      <h2 style={{ marginTop: '1rem', color: 'var(--vert-fonce)' }}>
        📋 {indication.nom}
      </h2>
      {indication.synonymes && (
        <p style={{ color: 'var(--texte-doux)', fontStyle: 'italic' }}>
          Aussi appelé : {indication.synonymes}
        </p>
      )}
      {indication.type && (
        <p style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: 'var(--texte-doux)' }}>
          Type : {indication.type}
        </p>
      )}

      {/* Formulation prudente imposée par le cahier des charges */}
      <Avertissement compact />

      <section className="section">
        <h2>
          {message || 'Remèdes associés à cette indication'} ({remedes.length})
        </h2>

        {remedes.length === 0 && (
          <p className="vide">Aucun remède publié n'est rapporté pour cette indication.</p>
        )}

        <div className="grille">
          {remedes.map((r) => (
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
    </div>
  );
}