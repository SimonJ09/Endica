import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const STATUTS = {
  en_attente: { label: 'En attente', couleur: '#f9a825' },
  valide: { label: 'Validé', couleur: '#2e7d32' },
  rejete: { label: 'Rejeté', couleur: '#b71c1c' },
};

export default function Medias() {
  const [medias, setMedias] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('en_attente');
  const [message, setMessage] = useState('');

  const charger = () => {
    setChargement(true);
    api.get('/admin/media')
      .then((res) => setMedias(res.data.medias))
      .catch(() => setMessage('❌ Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/admin/media/${id}/statut`, { statut });
      setMedias((prev) => prev.map((m) => (m.id === id ? { ...m, statut } : m)));
    } catch {
      setMessage('❌ Erreur.');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce média définitivement ?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      setMedias((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setMessage('❌ Erreur.');
    }
  };

  const filtres = medias.filter((m) => m.statut === filtre);

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <h1>📷 Médias</h1>
      <p style={{ color: 'var(--texte-doux)', marginBottom: '1.5rem' }}>
        Tous les médias de la plateforme
      </p>

      {message && <div className="avertissement compact"><p>{message}</p></div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['en_attente', 'valide', 'rejete'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className="btn"
            style={{
              background: filtre === f ? 'var(--vert)' : 'white',
              color: filtre === f ? 'white' : 'var(--vert)',
              border: '2px solid var(--vert)',
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
            }}
          >
            {STATUTS[f].label} ({medias.filter((m) => m.statut === f).length})
          </button>
        ))}
      </div>

      {filtres.length === 0 && <p className="vide">Aucun média dans cette catégorie.</p>}

      <div className="grille">
        {filtres.map((m) => (
          <div key={m.id} className="carte">
            {m.type === 'image' && (
              <img
                src={m.url}
                alt={m.titre}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.6rem' }}
              />
            )}
            {m.type === 'video' && (
              <video src={m.url} controls style={{ width: '100%', borderRadius: '6px', marginBottom: '0.6rem' }} />
            )}
            {m.type === 'document' && (
              <a href={m.url} target="_blank" rel="noreferrer" style={{
                display: 'block', height: '160px', background: '#eee', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', marginBottom: '0.6rem', textDecoration: 'none'
              }}>📄</a>
            )}

            <strong style={{ fontSize: '0.95rem' }}>{m.titre || '(sans titre)'}</strong>

            {m.remede_nom && (
              <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
                <Link to={`/remedes/${m.remede_id}`}>🌿 {m.remede_nom}</Link>
              </p>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--texte-doux)', marginTop: '0.4rem' }}>
              {m.auteur && `© ${m.auteur} · `}
              {new Date(m.date_ajout).toLocaleDateString('fr-FR')}
            </p>

            <p style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: STATUTS[m.statut]?.couleur, marginTop: '0.4rem'
            }}>
              ● {STATUTS[m.statut]?.label}
            </p>

            <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {m.statut !== 'valide' && (
                <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => changerStatut(m.id, 'valide')}>✅ Valider</button>
              )}
              {m.statut !== 'rejete' && (
                <button className="btn secondaire" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => changerStatut(m.id, 'rejete')}>🚫</button>
              )}
              <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--rouge)' }}
                onClick={() => supprimer(m.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}