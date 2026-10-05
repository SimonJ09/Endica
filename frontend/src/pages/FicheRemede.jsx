import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [remede, setRemede] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [medias, setMedias] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [likes, setLikes] = useState(0);
  const [messageLike, setMessageLike] = useState('');

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
      .then(([resRemede, resComments, resMedia]) => {
        setRemede(resRemede.data);
        setLikes(resRemede.data.likes);
        setCommentaires(resComments.data.commentaires);
        setMedias(resMedia.data.medias);
      })
      .catch((err) => {
        console.error(err);
        setErreur('Impossible de charger ce remède.');
      })
      .finally(() => setChargement(false));
  }, [id]);

  // ---------- RETOUR INTELLIGENT ----------
  const retour = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
      await api.post(`/remedes/${id}/comments`, { pseudonyme: pseudo, contenu });
      setMessageCommentaire('✅ Commentaire envoyé. Il sera publié après modération.');
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
    <div className="container fiche-container">
      {/* ---------- RETOUR ---------- */}
      <button onClick={retour} className="btn-retour" type="button">
        ← Retour
      </button>

      {/* ---------- EN-TÊTE ---------- */}
      <header className="fiche-header">
        <h1>{remede.nom_local}</h1>
        {remede.nom_scientifique && (
          <p className="fiche-scientifique">{remede.nom_scientifique}</p>
        )}

        <div className="fiche-meta">
          <BadgeFiabilite niveau={remede.niveau_fiabilite} />
          <span>📍 {remede.region_origine || 'Région non précisée'}</span>
          <span>👁 {remede.vues} consultations</span>
          <button
            className="btn"
            onClick={liker}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.9rem' }}
            type="button"
          >
            ❤️ Liker ({likes})
          </button>
        </div>
        {messageLike && (
          <p style={{ marginTop: '0.5rem', color: 'var(--texte-doux)', fontSize: '0.9rem' }}>
            {messageLike}
          </p>
        )}
      </header>

      <Avertissement compact />

      {/* ---------- PHOTOS ET VIDÉOS ---------- */}
      <section className="section">
        <h2>📷 Photos, vidéos et documents</h2>

        {medias.length > 0 ? (
          <div className="medias-grille">
            {medias.map((m) => (
              <figure key={m.id} className="media-item">
                {m.type === 'image' && (
                  <a href={m.url} target="_blank" rel="noreferrer">
                    <img
                      src={m.url}
                      alt={m.titre || 'Photo du remède'}
                      loading="lazy"
                    />
                  </a>
                )}
                {m.type === 'video' && (
                  <video src={m.url} controls preload="metadata" />
                )}
                {m.type === 'document' && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="media-doc"
                  >
                    <span className="media-doc-icon">📄</span>
                    <span className="media-doc-label">Ouvrir le document</span>
                  </a>
                )}

                <figcaption>
                  {m.titre && <strong>{m.titre}</strong>}
                  {m.description && <p>{m.description}</p>}
                  <div className="media-source">
                    {m.auteur && <>© {m.auteur}</>}
                    {m.auteur && m.source && <> · </>}
                    {m.source && <>{m.source}</>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="media-placeholder">
            <div className="media-placeholder-icon">📷</div>
            <p>Aucune photo, vidéo ou document disponible pour ce remède.</p>
            <p className="media-placeholder-hint">
              Vous avez une photo à proposer ? Contribuez à enrichir cette fiche
              en nous contactant.
            </p>
          </div>
        )}
      </section>

      {/* ---------- DESCRIPTION ---------- */}
      {remede.description && (
        <section className="section">
          <h2>📝 Description</h2>
          <p>{remede.description}</p>
        </section>
      )}

      {/* ---------- INGRÉDIENTS ---------- */}
      {remede.ingredients && remede.ingredients.length > 0 && (
        <section className="section">
          <h2>🌿 Ingrédients</h2>
          <ul className="fiche-liste">
            {remede.ingredients.map((ing) => (
              <li key={ing.id}>
                <Link to={`/ingredients/${ing.id}`}>
                  <strong>{ing.nom}</strong>
                </Link>
                {ing.nom_scientifique && <em> ({ing.nom_scientifique})</em>}
                {ing.partie_utilisee && <> — partie utilisée : {ing.partie_utilisee}</>}
                {ing.quantite && <> — {ing.quantite} {ing.unite || ''}</>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- INDICATIONS ---------- */}
      {remede.indications && remede.indications.length > 0 && (
        <section className="section">
          <h2>📋 Indications rapportées</h2>
          <p className="fiche-note">
            Remèdes traditionnellement rapportés pour cette indication.
          </p>
          <ul className="fiche-liste">
            {remede.indications.map((ind) => (
              <li key={ind.id}>
                <Link to={`/indications/${ind.id}`}>
                  <strong>{ind.nom}</strong>
                </Link>
                {ind.synonymes && (
                  <span style={{ color: 'var(--texte-doux)' }}> ({ind.synonymes})</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- PRÉPARATION ---------- */}
      {remede.mode_preparation && (
        <section className="section">
          <h2>⚗️ Mode de préparation rapporté</h2>
          <p>{remede.mode_preparation}</p>
          <Avertissement compact />
        </section>
      )}

      {/* ---------- POSOLOGIE ---------- */}
      {remede.posologie && (
        <section className="section">
          <h2>⚠️ Posologie</h2>
          <p>{remede.posologie}</p>
        </section>
      )}

      {/* ---------- COMMENTAIRES ---------- */}
      <section className="section">
        <h2>💬 Commentaires ({commentaires.length})</h2>

        {commentaires.length === 0 && (
          <p className="vide">Aucun commentaire publié pour le moment.</p>
        )}

        {commentaires.map((c) => (
          <div key={c.id} className="commentaire-carte">
            <div className="commentaire-header">
              <strong>{c.pseudonyme}</strong>
              <span className="commentaire-date">
                {new Date(c.date_ajout).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p>{c.contenu}</p>
          </div>
        ))}

        <h3 className="commentaire-form-titre">Ajouter un commentaire</h3>
        <p className="commentaire-form-note">
          Votre commentaire sera publié après modération.
        </p>
        <form onSubmit={envoyerCommentaire} className="commentaire-form">
          <input
            type="text"
            placeholder="Votre pseudonyme"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            className="form-input"
          />
          <textarea
            placeholder="Votre commentaire (il sera publié après modération)"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            className="form-input"
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