import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';

const STATUTS = {
  en_attente: { label: 'En attente', couleur: '#f9a825' },
  valide: { label: 'Validé', couleur: '#2e7d32' },
  rejete: { label: 'Rejeté', couleur: '#b71c1c' },
};

export default function MediaUploader({ remedeId }) {
  const [medias, setMedias] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    titre: '', description: '', source: '', auteur: '',
  });
  const [fichier, setFichier] = useState(null);
  const inputRef = useRef();

  const charger = () => {
    setChargement(true);
    api.get('/admin/media', { params: { remede_id: remedeId } })
      .then((res) => setMedias(res.data.medias))
      .catch(() => setMessage('❌ Erreur de chargement.'))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (remedeId) charger();
  }, [remedeId]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!fichier) {
      setMessage('❌ Choisis un fichier.');
      return;
    }

    setUploadEnCours(true);
    setMessage('');

    const data = new FormData();
    data.append('fichier', fichier);
    data.append('titre', form.titre);
    data.append('description', form.description);
    data.append('source', form.source);
    data.append('auteur', form.auteur);

    try {
      await api.post(`/admin/remedes/${remedeId}/media`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Média uploadé. Il sera visible après validation.');
      setFichier(null);
      setForm({ titre: '', description: '', source: '', auteur: '' });
      if (inputRef.current) inputRef.current.value = '';
      charger();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.erreur || 'Erreur lors de l\'upload.'));
    } finally {
      setUploadEnCours(false);
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/admin/media/${id}/statut`, { statut });
      setMedias((prev) =>
        prev.map((m) => (m.id === id ? { ...m, statut } : m))
      );
    } catch {
      setMessage('❌ Erreur.');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce média définitivement ?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      setMedias((prev) => prev.filter((m) => m.id !== id));
      setMessage('✅ Média supprimé.');
    } catch {
      setMessage('❌ Erreur.');
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem' }}>
        📷 Médias ({medias.length})
      </h3>

      {message && (
        <div className="avertissement compact">
          <p>{message}</p>
        </div>
      )}

      {/* Formulaire d'upload */}
      <form onSubmit={envoyer} style={{
        background: '#fafafa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.2rem',
        border: '1px dashed var(--bordure)',
      }}>
        <label className="form-label">Fichier (image, vidéo ou PDF, max 10 Mo) *</label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,application/pdf"
          onChange={(e) => setFichier(e.target.files[0])}
          className="form-input"
        />

        <label className="form-label">Titre</label>
        <input
          type="text"
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          className="form-input"
          placeholder="Ex : Feuilles de neem fraîches"
        />

        <label className="form-label">Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="form-input"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
          <div>
            <label className="form-label">Source</label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Auteur</label>
            <input
              type="text"
              value={form.auteur}
              onChange={(e) => setForm({ ...form, auteur: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={uploadEnCours}
          style={{ marginTop: '0.8rem' }}
        >
          {uploadEnCours ? '⏳ Upload…' : '⬆️ Uploader'}
        </button>
      </form>

      {/* Liste des médias */}
      {chargement && <p className="chargement">Chargement des médias…</p>}

      {!chargement && medias.length === 0 && (
        <p className="vide">Aucun média pour ce remède.</p>
      )}

      {medias.map((m) => (
        <div key={m.id} style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.8rem',
          border: '1px solid var(--bordure)',
          borderRadius: '8px',
          marginBottom: '0.7rem',
          alignItems: 'flex-start',
          background: 'white',
        }}>
          {/* Aperçu */}
          <div style={{ width: '80px', flexShrink: 0 }}>
            {m.type === 'image' && (
              <img
                src={m.url}
                alt={m.titre}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
              />
            )}
            {m.type === 'video' && (
              <div style={{
                width: '80px', height: '80px', background: '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', color: 'white', fontSize: '1.5rem'
              }}>▶</div>
            )}
            {m.type === 'document' && (
              <div style={{
                width: '80px', height: '80px', background: '#eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', fontSize: '1.5rem'
              }}>📄</div>
            )}
          </div>

          {/* Infos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{m.titre || '(sans titre)'}</strong>
            {m.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--texte-doux)', margin: '0.2rem 0' }}>
                {m.description}
              </p>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--texte-doux)', marginTop: '0.3rem' }}>
              {m.auteur && `© ${m.auteur} · `}
              {m.source && `Source : ${m.source} · `}
              {new Date(m.date_ajout).toLocaleDateString('fr-FR')}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: STATUTS[m.statut]?.couleur,
              }}>
                ● {STATUTS[m.statut]?.label}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {m.statut !== 'valide' && (
              <button
                className="btn"
                onClick={() => changerStatut(m.id, 'valide')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                title="Valider"
              >
                ✅
              </button>
            )}
            {m.statut !== 'rejete' && (
              <button
                className="btn secondaire"
                onClick={() => changerStatut(m.id, 'rejete')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                title="Rejeter"
              >
                🚫
              </button>
            )}
            <button
              className="btn"
              onClick={() => supprimer(m.id)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--rouge)' }}
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}