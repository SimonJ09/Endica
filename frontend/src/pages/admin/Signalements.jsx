import { useState, useEffect } from 'react';
import api from '../../api/client';

const MOTIFS = {
  'Information incorrecte': '⚠️',
  'Information dangereuse': '🚨',
  'Source incorrecte': '📚',
  'Contenu inapproprié': '🚫',
  'Problème de droits': '©️',
  'Autre': '❓',
};

export default function Signalements() {
  const [signalements, setSignalements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');
  const [filtre, setFiltre] = useState('nouveau');

  const charger = () => {
    setChargement(true);
    api.get('/admin/signalements')
      .then((res) => setSignalements(res.data.signalements))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const traiter = async (id, statut) => {
    try {
      await api.patch(`/admin/signalements/${id}`, { statut });
      setSignalements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, statut } : s))
      );
      setMessage(`✅ Signalement marqué comme "${statut}".`);
    } catch (err) {
      setMessage('❌ Erreur.');
    }
  };

  const filtres = signalements.filter((s) => s.statut === filtre);

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <h1>🚨 Signalements</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['nouveau', 'traite', 'rejete'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className="btn"
            style={{
              background: filtre === f ? 'var(--vert)' : 'white',
              color: filtre === f ? 'white' : 'var(--vert)',
              border: '2px solid var(--vert)',
            }}
          >
            {f} ({signalements.filter((s) => s.statut === f).length})
          </button>
        ))}
      </div>

      {message && <div className="avertissement compact"><p>{message}</p></div>}

      {filtres.length === 0 && <p className="vide">Aucun signalement dans cette catégorie.</p>}

      {filtres.map((s) => (
        <div key={s.id} className="carte" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <strong>
              {MOTIFS[s.motif] || '❓'} {s.motif}
            </strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--texte-doux)' }}>
              {new Date(s.date_ajout).toLocaleString('fr-FR')}
            </span>
          </div>

          <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Cible : <strong>{s.type_cible}</strong> #{s.cible_id}
          </p>

          {s.pseudonyme && (
            <div style={{ marginTop: '0.7rem', background: '#fafafa', padding: '0.7rem', borderRadius: '6px', fontSize: '0.9rem' }}>
              <strong>{s.pseudonyme}</strong> a écrit :
              <br />
              <em>« {s.contenu} »</em>
            </div>
          )}

          {s.details && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--texte-doux)' }}>
              Détails : {s.details}
            </p>
          )}

          {s.statut === 'nouveau' && (
            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn" onClick={() => traiter(s.id, 'traite')}>
                ✅ Marquer traité
              </button>
              <button className="btn" onClick={() => traiter(s.id, 'rejete')} style={{ background: 'var(--texte-doux)' }}>
                ❌ Rejeter
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}