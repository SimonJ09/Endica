import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import MediaUploader from '../../components/admin/MediaUploader';

export default function RemedeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const estEdition = Boolean(id);

  const [form, setForm] = useState({
    nom_local: '',
    nom_scientifique: '',
    description: '',
    mode_preparation: '',
    posologie: '',
    region_origine: '',
    niveau_fiabilite: 1,
    statut: 'en_attente',
    ingredients: [],
    indications: [],
  });

  const [tousIngredients, setTousIngredients] = useState([]);
  const [toutesIndications, setToutesIndications] = useState([]);
  const [chargement, setChargement] = useState(estEdition);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  // Charger la liste des ingrédients et indications
  useEffect(() => {
    Promise.all([
      api.get('/ingredients'),
      api.get('/indications'),
    ]).then(([resIng, resInd]) => {
      setTousIngredients(resIng.data.ingredients);
      setToutesIndications(resInd.data.indications);
    });
  }, []);

  // Charger le remède si édition
  useEffect(() => {
    if (!estEdition) return;
    api.get(`/remedes/${id}`)
      .then((res) => {
        const r = res.data;
        setForm({
          nom_local: r.nom_local || '',
          nom_scientifique: r.nom_scientifique || '',
          description: r.description || '',
          mode_preparation: r.mode_preparation || '',
          posologie: r.posologie || '',
          region_origine: r.region_origine || '',
          niveau_fiabilite: r.niveau_fiabilite || 1,
          statut: r.statut || 'en_attente',
          ingredients: r.ingredients.map((i) => i.id),
          indications: r.indications.map((i) => i.id),
        });
      })
      .catch(() => setErreur('Impossible de charger le remède.'))
      .finally(() => setChargement(false));
  }, [id, estEdition]);

  const changerChamp = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const changerMulti = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options)
      .filter((o) => o.selected)
      .map((o) => parseInt(o.value));
    setForm((prev) => ({ ...prev, [name]: values }));
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setMessage('');

    try {
      if (estEdition) {
        await api.put(`/admin/remedes/${id}`, form);
        setMessage('✅ Remède mis à jour.');
        setTimeout(() => navigate('/admin/remedes'), 800);
      } else {
        const res = await api.post('/admin/remedes', form);
        setMessage(`✅ Remède créé (id ${res.data.id}).`);
        setTimeout(() => navigate('/admin/remedes'), 800);
      }
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'enregistrement.');
    }
  };

  if (chargement) return <div className="chargement">Chargement…</div>;

  return (
    <div>
      <Link to="/admin/remedes" style={{ fontSize: '0.9rem' }}>
        ← Retour à la liste
      </Link>

      <h1 style={{ marginTop: '0.5rem' }}>
        {estEdition ? `✏️ Éditer : ${form.nom_local}` : '➕ Nouveau remède'}
      </h1>

      {erreur && <div className="erreur">{erreur}</div>}
      {message && <div className="avertissement compact"><p>{message}</p></div>}

      <form onSubmit={soumettre} style={{ marginTop: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
        {/* --- Bloc identité --- */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--vert-fonce)' }}>📝 Identité</h3>

        <label className="form-label">Nom local *</label>
        <input
          type="text"
          name="nom_local"
          value={form.nom_local}
          onChange={changerChamp}
          required
          className="form-input"
        />

        <label className="form-label">Nom scientifique</label>
        <input
          type="text"
          name="nom_scientifique"
          value={form.nom_scientifique}
          onChange={changerChamp}
          className="form-input"
        />

        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={changerChamp}
          rows={3}
          className="form-input"
        />

        {/* --- Bloc préparation --- */}
        <h3 style={{ margin: '1.5rem 0 1rem', color: 'var(--vert-fonce)' }}>⚗️ Préparation</h3>

        <label className="form-label">Mode de préparation rapporté</label>
        <textarea
          name="mode_preparation"
          value={form.mode_preparation}
          onChange={changerChamp}
          rows={3}
          className="form-input"
        />

        <label className="form-label">Posologie (information disponible)</label>
        <textarea
          name="posologie"
          value={form.posologie}
          onChange={changerChamp}
          rows={2}
          className="form-input"
        />

        {/* --- Bloc contexte --- */}
        <h3 style={{ margin: '1.5rem 0 1rem', color: 'var(--vert-fonce)' }}>📍 Contexte</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Région d'origine</label>
            <input
              type="text"
              name="region_origine"
              value={form.region_origine}
              onChange={changerChamp}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Niveau de fiabilité</label>
            <select
              name="niveau_fiabilite"
              value={form.niveau_fiabilite}
              onChange={changerChamp}
              className="form-input"
            >
              <option value={1}>1 — Non vérifié</option>
              <option value={2}>2 — Témoignage</option>
              <option value={3}>3 — Documenté</option>
              <option value={4}>4 — Données scientifiques</option>
              <option value={5}>5 — Validation scientifique</option>
            </select>
          </div>
          <div>
            <label className="form-label">Statut</label>
            <select
              name="statut"
              value={form.statut}
              onChange={changerChamp}
              className="form-input"
            >
              <option value="en_attente">En attente</option>
              <option value="publie">Publié</option>
              <option value="rejete">Rejeté</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>

        {/* --- Bloc relations --- */}
        <h3 style={{ margin: '1.5rem 0 1rem', color: 'var(--vert-fonce)' }}>🔗 Relations</h3>

        <label className="form-label">
          Ingrédients (maintenir Ctrl/Cmd pour sélection multiple)
        </label>
        <select
          multiple
          name="ingredients"
          value={form.ingredients.map(String)}
          onChange={changerMulti}
          className="form-input"
          style={{ minHeight: '120px' }}
        >
          {tousIngredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.nom} {ing.partie_utilisee ? `— ${ing.partie_utilisee}` : ''}
            </option>
          ))}
        </select>

        <label className="form-label" style={{ marginTop: '1rem' }}>
          Indications (maintenir Ctrl/Cmd pour sélection multiple)
        </label>
        <select
          multiple
          name="indications"
          value={form.indications.map(String)}
          onChange={changerMulti}
          className="form-input"
          style={{ minHeight: '120px' }}
        >
          {toutesIndications.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.nom} {ind.synonymes ? `(${ind.synonymes})` : ''}
            </option>
          ))}
        </select>
      </form>

              {/* --- Boutons --- */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.7rem' }}>
          <button type="submit" className="btn">
            {estEdition ? '💾 Enregistrer' : '➕ Créer le remède'}
          </button>
          <Link to="/admin/remedes" className="btn secondaire">
            Annuler
          </Link>
        </div>

        {estEdition && (
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--bordure)' }}>
            <MediaUploader remedeId={id} />
        </div>
        )}
    </div>
  );
}