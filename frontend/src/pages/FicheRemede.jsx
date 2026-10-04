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
  return (
    <span className={`badge n${niveau}`}>
      Niveau {niveau} — {labels[niveau] || 'N/A'}
    </span>
  );
}

export default function FicheRemede() {
  const { id } = useParams();
  const [remede, setRemede] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [likes, setLikes] = useState(0);
  const [messageLike, setMessageLike] = useState('');
  const [medias, setMedias] = useState([]);

  // Formulaire commentaire
  const [pseudo, setPseudo] = useState('');
  const [contenu, setContenu] = useState('');
  const [messageCommentaire, setMessageCommentaire] = useState('');

  useEffect(() => {
    setChargement(true);
    Promise.all([
      api.get(`/remedes/${id}`),
      api.get(`/remedes/${id}/comments`),
      api.get(`/remedes/${id}/media`),
    ])
      .then(([resRemede, resComments]) => {
        setRemede(resRemede.data);
        setLikes(resRemede.data.likes);
        setCommentaires(resComments.data.commentaires);
      })
      .catch((err) => {
        console.error(err);
        setErreur('Impossible de charger ce remède.');
      })
      .finally(() => setChargement(false));
  }, [id]);

  const liker = async () => {
    try {
      const res = await api.post(`/remedes/${id}/like`);
      setLikes(res.data.likes);
      setMessageLike('');
    } catch (err) {
      if (err.response?.status === 409) {
        setMessageLike('Vous avez déjà liké ce remède.');
      } else {
        setMessageLike('Erreur lors du like.');
      }
    }
  };

  const envoyerCommentaire = async (e) => {
    e.preventDefault();
    setMessageCommentaire('');
    try {
      await api.post(`/remedes/${id}/comments`, {
        pseudonyme: pseudo,
        contenu: contenu,
      });
      setMessageCommentaire(
        '✅ Commentaire envoyé. Il sera publié après modération.'
      );
      setPseudo('');
      setContenu('');
    } catch (err) {
      setMessageCommentaire(
        '❌ ' + (err.response?.data?.erreur || 'Erreur lors de l\'envoi.')
      );
    }
  };

  if (chargement) return <div className="container chargement">Chargement…</div>;
  if (erreur) return <div className="container erreur">{erreur}</div>;
  if (!remede) return <div className="container vide">Remède introuvable.</div>;

  return (
    <div className="container">
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Retour à l'accueil
      </Link>

      <h2 style={{ marginTop: '1rem', color: 'var(--vert-fonce)' }}>
        {remede.nom_local}
      </h2>
      {remede.nom_scientifique && (
        <p style={{ fontStyle: 'italic', color: 'var(--texte-doux)' }}>
          {remede.nom_scientifique}
        </p>
      )}

      <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <BadgeFiabilite niveau={remede.niveau_fiabilite} />
        <span>📍 {remede.region_origine || 'Région non précisée'}</span>
        <span>👁 {remede.vues} consultations</span>
        <button className="btn" onClick={liker} style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem' }}>
          ❤️ Liker ({likes})
        </button>
      </div>
      {messageLike && <p style={{ marginTop: '0.5rem', color: 'var(--texte-doux)', fontSize: '0.9rem' }}>{messageLike}</p>}

      <Avertissement compact />

      {remede.description && (
        <section className="section">
          <h2>📝 Description</h2>
          <p>{remede.description}</p>
        </section>
      )}

      {medias.length > 0 && (
        <section className="section">
            <h2>📷 Photos et vidéos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.7rem' }}>
            {medias.map((m) => (
                <figure key={m.id} style={{ margin: 0 }}>
                {m.type === 'image' && (
                    <img
                    src={m.url}
                    alt={m.titre}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                )}
                {m.type === 'video' && (
                    <video src={m.url} controls style={{ width: '100%', borderRadius: '6px' }} />
                )}
                {m.type === 'document' && (
                    <a href={m.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex', height: '160px', background: '#eee', borderRadius: '6px',
                    alignItems: 'center', justifyContent: 'center', fontSize: '2rem', textDecoration: 'none'
                    }}>📄</a>
                )}
                <figcaption style={{ fontSize: '0.8rem', color: 'var(--texte-doux)', marginTop: '0.3rem' }}>
                    {m.titre}
                    {m.auteur && <> — © {m.auteur}</>}
                </figcaption>
                </figure>
            ))}
            </div>
        </section>
    )}

      {remede.ingredients.map((ing) => (
        <li key={ing.id} style={{ marginBottom: '0.4rem' }}>
        <Link to={`/ingredients/${ing.id}`}>
            <strong>{ing.nom}</strong>
        </Link>
        {ing.nom_scientifique && <em> ({ing.nom_scientifique})</em>}
        {ing.partie_utilisee && <> — {ing.partie_utilisee}</>}
        </li>
       ))}

      {remede.indications.map((ind) => (
        <li key={ind.id} style={{ marginBottom: '0.4rem' }}>
        <Link to={`/indications/${ind.id}`}>
            <strong>{ind.nom}</strong>
        </Link>
        {ind.synonymes && <span style={{ color: 'var(--texte-doux)' }}> ({ind.synonymes})</span>}
        </li>
        ))}

      {remede.mode_preparation && (
        <section className="section">
          <h2>⚗️ Mode de préparation rapporté</h2>
          <p>{remede.mode_preparation}</p>
          <Avertissement compact />
        </section>
      )}

      {remede.posologie && (
        <section className="section">
          <h2>⚠️ Posologie</h2>
          <p>{remede.posologie}</p>
        </section>
      )}

      {/* COMMENTAIRES */}
      <section className="section">
        <h2>💬 Commentaires ({commentaires.length})</h2>

        {commentaires.length === 0 && (
          <p className="vide">Aucun commentaire publié pour le moment.</p>
        )}

        {commentaires.map((c) => (
          <div key={c.id} className="carte" style={{ marginBottom: '0.6rem' }}>
            <strong>{c.pseudonyme}</strong>
            <span style={{ color: 'var(--texte-doux)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
              {new Date(c.date_ajout).toLocaleDateString('fr-FR')}
            </span>
            <p style={{ marginTop: '0.4rem' }}>{c.contenu}</p>
          </div>
        ))}

        <h3 style={{ marginTop: '1.5rem', fontSize: '1rem' }}>Ajouter un commentaire</h3>
        <form onSubmit={envoyerCommentaire} style={{ marginTop: '0.6rem' }}>
          <input
            type="text"
            placeholder="Votre pseudonyme"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', border: '1px solid var(--bordure)', borderRadius: '6px' }}
          />
          <textarea
            placeholder="Votre commentaire (il sera publié après modération)"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', border: '1px solid var(--bordure)', borderRadius: '6px', fontFamily: 'inherit' }}
          />
          <button className="btn" type="submit">Envoyer</button>
        </form>
        {messageCommentaire && (
          <p style={{ marginTop: '0.6rem', fontSize: '0.9rem' }}>{messageCommentaire}</p>
        )}
      </section>
    </div>
  );
}