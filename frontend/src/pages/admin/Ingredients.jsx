import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');
  const [recherche, setRecherche] = useState('');
  const [modal, setModal] = useState(null); // null | 'nouveau' | ingredient à éditer
  const [form, setForm] = useState({
    nom: '', nom_local: '', nom_scientifique: '',
    description: '', partie_utilisee: '', source: '',
  });
  const [confirmSuppr, setConfirmSuppr] = useState(null);

  const charger = () => {
    setChargement(true);
    api.get('/admin/ingredients')
      .then((res) => setIngredients(res.data.ingredients))
      .catch(() => setMessage('❌ Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirCreation = () => {
    setForm({ nom: '', nom_local: '', nom_scientifique: '', description: '', partie_utilisee: '', source: '' });
    setModal('nouveau');
  };

  const ouvrirEdition = (ing) => {
    setForm({
      nom: ing.nom || '', nom_local: ing.nom_local || '',
      nom_scientifique: ing.nom_scientifique || '',
      description: ing.description || '',
      partie_utilisee: ing.partie_utilisee || '',
      source: ing.source || '',
    });
    setModal(ing);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (modal === 'nouveau') {
        await api.post('/admin/ingredients', form);
        setMessage('✅ Ingrédient créé.');
      } else {
        await api.put(`/admin/ingredients/${modal.id}`, form);
        setMessage('✅ Ingrédient modifié.');
      }
      setModal(null);
      charger();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.erreur || 'Erreur.'));
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/admin/ingredients/${id}`);
      setMessage('✅ Ingrédient supprimé.');
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      setConfirmSuppr(null);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.erreur || 'Erreur.'));
      setConfirmSuppr(null);
    }
  };

  const filtres = ingredients.filter((i) =>
    i.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    (i.nom_scientifique || '').toLowerCase().includes(recherche.toLowerCase())
  );

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>🧪 Ingrédients</h1>
          <p style={{ color: 'var(--texte-doux)' }}>{ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn" onClick={ouvrirCreation} style={{ padding: '0.7rem 1.3rem' }}>
          ➕ Nouvel ingrédient
        </button>
      </div>

      {message && <div className="avertissement compact"><p>{message}</p></div>}

      <input
        type="text"
        placeholder="Rechercher un ingrédient…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="form-input"
        style={{ maxWidth: '400px', marginBottom: '1.5rem' }}
      />

      {filtres.length === 0 && <p className="vide">Aucun ingrédient.</p>}

      {filtres.length > 0 && (
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid var(--bordure)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f4f5f7', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '0.8rem' }}>Nom</th>
                  <th style={{ padding: '0.8rem' }}>Partie utilisée</th>
                  <th style={{ padding: '0.8rem' }}>Utilisé dans</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((ing) => (
                  <tr key={ing.id} style={{ borderTop: '1px solid var(--bordure)' }}>
                    <td style={{ padding: '0.8rem' }}>
                      <strong>{ing.nom}</strong>
                      {ing.nom_scientifique && (
                        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--texte-doux)' }}>
                          {ing.nom_scientifique}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.8rem' }}>{ing.partie_utilisee || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>
                      {ing.nb_remedes} remède{ing.nb_remedes > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn secondaire"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}
                        onClick={() => ouvrirEdition(ing)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'var(--rouge)' }}
                        onClick={() => setConfirmSuppr(ing)}
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
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem' }}>
              {modal === 'nouveau' ? '➕ Nouvel ingrédient' : `✏️ Éditer : ${modal.nom}`}
            </h3>
            <form onSubmit={soumettre}>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })} required />

              <label className="form-label">Nom local</label>
              <input className="form-input" value={form.nom_local}
                onChange={(e) => setForm({ ...form, nom_local: e.target.value })} />

              <label className="form-label">Nom scientifique</label>
              <input className="form-input" value={form.nom_scientifique}
                onChange={(e) => setForm({ ...form, nom_scientifique: e.target.value })} />

              <label className="form-label">Partie utilisée</label>
              <input className="form-input" value={form.partie_utilisee}
                onChange={(e) => setForm({ ...form, partie_utilisee: e.target.value })}
                placeholder="Feuille, racine, écorce…" />

              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <label className="form-label">Source</label>
              <input className="form-input" value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })} />

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