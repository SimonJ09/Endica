import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const STATUTS = {
  en_attente: { label: 'En attente', couleur: '#f9a825' },
  publie: { label: 'Publié', couleur: '#2e7d32' },
  rejete: { label: 'Rejeté', couleur: '#b71c1c' },
  archive: { label: 'Archivé', couleur: '#555' },
};

const NIVEAUX = {
  1: 'Non vérifié',
  2: 'Témoignage',
  3: 'Documenté',
  4: 'Données scientifiques',
  5: 'Validation scientifique',
};

export default function Remedes() {
  const [remedes, setRemedes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [confirmSuppr, setConfirmSuppr] = useState(null);

  const charger = () => {
    setChargement(true);
    api.get('/admin/remedes')
      .then((res) => setRemedes(res.data.remedes))
      .catch(() => setMessage('❌ Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/admin/remedes/${id}/statut`, { statut });
      setRemedes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut } : r))
      );
      setMessage(`✅ Statut mis à jour.`);
    } catch {
      setMessage('❌ Erreur.');
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/admin/remedes/${id}`);
      setRemedes((prev) => prev.filter((r) => r.id !== id));
      setMessage('✅ Remède supprimé.');
      setConfirmSuppr(null);
    } catch {
      setMessage('❌ Erreur lors de la suppression.');
    }
  };

  const remedesFiltres = filtre === 'tous'
    ? remedes
    : remedes.filter((r) => r.statut === filtre);

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>🌿 Remèdes</h1>
          <p style={{ color: 'var(--texte-doux)' }}>
            {remedes.length} remède{remedes.length > 1 ? 's' : ''} dans la base
          </p>
        </div>
        <Link to="/admin/remedes/nouveau" className="btn" style={{ padding: '0.7rem 1.3rem' }}>
          ➕ Nouveau remède
        </Link>
      </div>

      {message && (
        <div className="avertissement compact">
          <p>{message}</p>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['tous', 'en_attente', 'publie', 'rejete', 'archive'].map((f) => (
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
            {f === 'tous' ? 'Tous' : STATUTS[f].label} (
            {f === 'tous' ? remedes.length : remedes.filter((r) => r.statut === f).length}
            )
          </button>
        ))}
      </div>

      {remedesFiltres.length === 0 && (
        <p className="vide">Aucun remède dans cette catégorie.</p>
      )}

      {/* Tableau */}
      {remedesFiltres.length > 0 && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid var(--bordure)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f4f5f7', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '0.8rem' }}>Nom</th>
                  <th style={{ padding: '0.8rem' }}>Région</th>
                  <th style={{ padding: '0.8rem' }}>Fiabilité</th>
                  <th style={{ padding: '0.8rem' }}>Statut</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {remedesFiltres.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--bordure)' }}>
                    <td style={{ padding: '0.8rem' }}>
                      <strong>{r.nom_local}</strong>
                      {r.nom_scientifique && (
                        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--texte-doux)' }}>
                          {r.nom_scientifique}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--texte-doux)', marginTop: '0.2rem' }}>
                        {r.nb_ingredients} ingr. · {r.nb_indications} ind. · 👁 {r.vues} · ❤️ {r.likes}
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem' }}>{r.region_origine || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span className={`badge n${r.niveau_fiabilite}`}>
                        N{r.niveau_fiabilite} — {NIVEAUX[r.niveau_fiabilite]}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{
                        color: STATUTS[r.statut].couleur,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}>
                        ● {STATUTS[r.statut].label}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r.statut !== 'publie' && (
                        <button
                          onClick={() => changerStatut(r.id, 'publie')}
                          className="btn"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}
                          title="Publier"
                        >
                          ✅
                        </button>
                      )}
                      {r.statut === 'publie' && (
                        <button
                          onClick={() => changerStatut(r.id, 'archive')}
                          className="btn secondaire"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}
                          title="Archiver"
                        >
                          📦
                        </button>
                      )}
                      <Link
                        to={`/admin/remedes/${r.id}/edit`}
                        className="btn secondaire"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}
                        title="Éditer"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => setConfirmSuppr(r)}
                        className="btn"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'var(--rouge)' }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale de confirmation */}
      {confirmSuppr && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ color: 'var(--rouge)' }}>⚠️ Confirmer la suppression</h3>
            <p style={{ margin: '1rem 0' }}>
              Supprimer définitivement <strong>{confirmSuppr.nom_local}</strong> ?
              <br />
              <span style={{ fontSize: '0.85rem', color: 'var(--texte-doux)' }}>
                Cette action est irréversible.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn secondaire" onClick={() => setConfirmSuppr(null)}>
                Annuler
              </button>
              <button
                className="btn"
                style={{ background: 'var(--rouge)' }}
                onClick={() => supprimer(confirmSuppr.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}