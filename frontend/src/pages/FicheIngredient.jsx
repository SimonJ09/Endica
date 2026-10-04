import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function FicheIngredient() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    api.get(`/ingredients/${id}/remedes`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setErreur('Impossible de charger cet ingrédient.');
      })
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <div className="container chargement">Chargement…</div>;
  if (erreur) return <div className="container erreur">{erreur}</div>;
  if (!data) return null;

  const { ingredient, remedes } = data;

  return (
    <div className="container">
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Retour à l'accueil
      </Link>

      <h2 style={{ marginTop: '1rem', color: 'var(--vert-fonce)' }}>
        🧪 {ingredient.nom}
      </h2>
      {ingredient.nom_scientifique && (
        <p style={{ fontStyle: 'italic', color: 'var(--texte-doux)' }}>
          {ingredient.nom_scientifique}
        </p>
      )}
      {ingredient.partie_utilisee && (
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Partie utilisée :</strong> {ingredient.partie_utilisee}
        </p>
      )}
      {ingredient.description && (
        <p style={{ marginTop: '0.5rem' }}>{ingredient.description}</p>
      )}

      <section className="section">
        <h2>
          🌿 Remèdes utilisant cet ingrédient ({remedes.length})
        </h2>

        {remedes.length === 0 && (
          <p className="vide">Aucun remède publié n'utilise cet ingrédient.</p>
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
              {r.quantite && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--texte-doux)' }}>
                  Quantité : {r.quantite} {r.unite || ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}