import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Indications() {
  const [indications, setIndications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');
  const [recherche, setRecherche] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    nom: '', description: '', synonymes: '', type: '',
  });
  const [confirmSuppr, setConfirmSuppr] = useState(null);

  const charger = () => {
    setChargement(true);
    api.get('/admin/indications')
      .then((res) => setIndications(res.data.indications))
      .catch(() => setMessage('❌ Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirCreation = () => {
    setForm({ nom: '', description: '', synonymes: '', type: '' });
    setModal('nouveau');
  };

  const ouvrirEdition = (ind) => {
    setForm({
      nom: ind.nom || '',
      description: ind.description || '',
      synonymes: ind.synonymes || '',
      type: ind.type || '',
    });
    setModal(ind);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (modal === 'nouveau') {
        await api.post('/admin/indications', form);
        setMessage('✅ Indication créée.');
      } else {
        await api.put(`/admin/indications/${modal.id}`, form);
        setMessage('✅ Indication modifiée.');
      }
      setModal(null);
      charger();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.erreur || 'Erreur.'));
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/admin/indications/${id}`);
      setMessage('✅ Indication supprimée.');
      setIndications((prev) => prev.filter((i) => i.id !== id));
      setConfirmSuppr(null);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.erreur || 'Erreur.'));
      setConfirmSuppr(null);
    }
  };

  const filtres = indications.filter((i) =>
    i.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    (i.synonymes || '').toLowerCase().includes(recherche.toLowerCase())
  );

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>📋 Indications</h1>
          <p style={{ color: 'var(--texte-doux)' }}>{indications.length} indication{indications.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn" onClick={ouvrirCreation} style={{ padding: '0.7rem 1.3rem' }}>
          ➕ Nouvelle indication
        </button>
      </div>

      {message && <div className="avertissement compact"><p>{message}</p></div>}

      <input
        type="text"
        placeholder="Rechercher une indication…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="form-input"
        style={{ maxWidth: '400px', marginBottom: '1.5rem' }}
      />

      {filtres.length === 0 && <p className="vide">Aucune indication.</p>}

      {filtres.length > 0 && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid var(--bordure)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f4f5f7', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '0.8rem' }}>Nom</th>
                  <th style={{ padding: '0.8rem' }}>Synonymes</th>
                  <th style={{ padding: '0.8rem' }}>Type</th>
                  <th style={{ padding: '0.8rem' }}>Utilisée dans</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((ind) => (
                  <tr key={ind.id} style={{ borderTop: '1px solid var(--bordure)' }}>
                    <td style={{ padding: '0.8rem' }}><strong>{ind.nom}</strong></td>
                    <td style={{ padding: '0.8rem', color: 'var(--texte-doux)' }}>{ind.synonymes || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>{ind.type || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>{ind.nb_remedes} remède{ind.nb_remedes > 1 ? 's' : ''}</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn secondaire"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}
                        onClick={() => ouvrirEdition(ind)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'var(--rouge)' }}
                        onClick={() => setConfirmSuppr(ind)}
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

      {/* Modale création / édition */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem', overflowY: 'auto',
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', maxWidth: '520px', width: '100%' }}>
            <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem' }}>
              {modal === 'nouveau' ? '➕ Nouvelle indication' : `✏️ Éditer : ${modal.nom}`}
            </h3>
            <form onSubmit={soumettre}>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })} required />

              <label className="form-label">Synonymes (séparés par des virgules)</label>
              <input className="form-input" value={form.synonymes}
                onChange={(e) => setForm({ ...form, synonymes: e.target.value })}
                placeholder="Ex : Palu, Malaria, Fièvre paludéenne" />

              <label className="form-label">Type / Catégorie</label>
              <input className="form-input" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Ex : Maladie infectieuse, Symptôme…" />

              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.7rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondaire" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn">
                  {modal === 'nouveau' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmSuppr && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ color: 'var(--rouge)' }}>⚠️ Confirmer</h3>
            <p style={{ margin: '1rem 0' }}>Supprimer <strong>{confirmSuppr.nom}</strong> ?</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn secondaire" onClick={() => setConfirmSuppr(null)}>Annuler</button>
              <button className="btn" style={{ background: 'var(--rouge)' }} onClick={() => supprimer(confirmSuppr.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}