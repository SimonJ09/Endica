import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Commentaires() {
  const [commentaires, setCommentaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  const charger = () => {
    setChargement(true);
    api.get('/admin/commentaires/en-attente')
      .then((res) => setCommentaires(res.data.commentaires))
      .catch((err) => setErreur('Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const changerStatut = async (id, statut) => {
    setMessage('');
    try {
      await api.patch(`/admin/commentaires/${id}/statut`, { statut });
      setMessage(`✅ Commentaire ${statut === 'publie' ? 'publié' : 'rejeté'}.`);
      // On retire le commentaire de la liste
      setCommentaires((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setMessage('❌ Erreur : ' + (err.response?.data?.erreur || 'inconnue'));
    }
  };

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <h1>💬 Modération des commentaires</h1>
      <p style={{ color: 'var(--texte-doux)', marginBottom: '2rem' }}>
        {commentaires.length} commentaire{commentaires.length > 1 ? 's' : ''} en attente
      </p>

      {erreur && <div className="erreur">{erreur}</div>}
      {message && <div className="avertissement compact"><p>{message}</p></div>}

      {commentaires.length === 0 && (
        <p className="vide">Aucun commentaire en attente. 🎉</p>
      )}

      {commentaires.map((c) => (
        <div key={c.id} className="carte" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{c.pseudonyme}</strong>
              <span style={{ color: 'var(--texte-doux)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                {new Date(c.date_ajout).toLocaleString('fr-FR')}
              </span>
            </div>
            <Link to={`/remedes/${c.remede_id}`} style={{ fontSize: '0.85rem' }}>
              🌿 {c.remede_nom}
            </Link>
          </div>

          <p style={{ marginTop: '0.7rem', padding: '0.7rem', background: '#fafafa', borderRadius: '6px' }}>
            {c.contenu}
          </p>

          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn"
              onClick={() => changerStatut(c.id, 'publie')}
              style={{ background: 'var(--vert)' }}
            >
              ✅ Publier
            </button>
            <button
              className="btn"
              onClick={() => changerStatut(c.id, 'rejete')}
              style={{ background: 'var(--rouge)' }}
            >
              ❌ Rejeter
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}