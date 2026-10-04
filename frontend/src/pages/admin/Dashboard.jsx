import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const NIVEAUX = {
  1: 'Non vérifié',
  2: 'Témoignage',
  3: 'Documenté',
  4: 'Données scientifiques',
  5: 'Validation scientifique',
};

const STATUTS = {
  en_attente: { label: 'En attente', couleur: '#f9a825' },
  publie: { label: 'Publié', couleur: '#2e7d32' },
  rejete: { label: 'Rejeté', couleur: '#b71c1c' },
  archive: { label: 'Archivé', couleur: '#555' },
};

function Carte({ emoji, valeur, label, couleur }) {
  return (
    <div className="stat-carte">
      <div style={{ fontSize: '1.8rem' }}>{emoji}</div>
      <div style={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: couleur || 'var(--vert-fonce)',
      }}>
        {valeur}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--texte-doux)' }}>
        {label}
      </div>
    </div>
  );
}

function Barre({ label, valeur, total, couleur = 'var(--vert)' }) {
  const pourcentage = total > 0 ? (valeur / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        <span>{label}</span>
        <strong>{valeur}</strong>
      </div>
      <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          width: `${pourcentage}%`,
          height: '100%',
          background: couleur,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.get('/admin/statistics')
      .then((res) => setData(res.data))
      .catch(() => setErreur('Impossible de charger les statistiques.'))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <div className="chargement">Chargement…</div>;
  if (erreur) return <div className="erreur">{erreur}</div>;
  if (!data) return null;

  const { compteurs, topVus, topLikes, parRegion, parFiabilite, parStatut, derniers, derniersCommentaires } = data;

  const totalRegions = parRegion.reduce((acc, r) => acc + r.n, 0);
  const totalFiabilite = parFiabilite.reduce((acc, f) => acc + f.n, 0);
  const totalStatut = parStatut.reduce((acc, s) => acc + s.n, 0);

  return (
    <div>
      <h1>📊 Tableau de bord</h1>
      <p style={{ color: 'var(--texte-doux)', marginBottom: '2rem' }}>
        Vue d'ensemble de la base documentaire
      </p>

      {/* --- COMPTEURS PRINCIPAUX --- */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--texte-doux)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vue d'ensemble
        </h3>
        <div className="stats-grille">
          <Carte emoji="🌿" valeur={compteurs.remedes} label="Remèdes" />
          <Carte emoji="🧪" valeur={compteurs.ingredients} label="Ingrédients" />
          <Carte emoji="📋" valeur={compteurs.indications} label="Indications" />
          <Carte emoji="👁" valeur={compteurs.vuesTotales} label="Vues totales" />
          <Carte emoji="❤️" valeur={compteurs.likesTotaux} label="Likes totaux" />
          <Carte emoji="💬" valeur={compteurs.commentaires} label="Commentaires" />
        </div>
      </section>

      {/* --- ALERTES --- */}
      {(compteurs.commentairesAttente > 0 || compteurs.signalementsNouveaux > 0 || compteurs.remedesAttente > 0) && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--texte-doux)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚠️ À traiter
          </h3>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            {compteurs.remedesAttente > 0 && (
              <Link to="/admin/remedes" className="btn" style={{ background: '#f9a825' }}>
                🌿 {compteurs.remedesAttente} remède(s) en attente
              </Link>
            )}
            {compteurs.commentairesAttente > 0 && (
              <Link to="/admin/commentaires" className="btn" style={{ background: '#f9a825' }}>
                💬 {compteurs.commentairesAttente} commentaire(s) à modérer
              </Link>
            )}
            {compteurs.signalementsNouveaux > 0 && (
              <Link to="/admin/signalements" className="btn" style={{ background: 'var(--rouge)' }}>
                🚨 {compteurs.signalementsNouveaux} signalement(s) nouveau(x)
              </Link>
            )}
          </div>
        </section>
      )}

      {/* --- TOP 5 --- */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {/* Top vus */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            👁 Top 5 remèdes les plus consultés
          </h3>
          {topVus.length === 0 && <p className="vide">Aucune donnée.</p>}
          {topVus.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < topVus.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 'bold', color: 'var(--texte-doux)', minWidth: '20px' }}>
                  {i + 1}.
                </span>
                <Link to={`/remedes/${r.id}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.nom_local}
                </Link>
              </div>
              <strong style={{ color: 'var(--vert-fonce)', marginLeft: '0.5rem' }}>{r.vues}</strong>
            </div>
          ))}
        </div>

        {/* Top likés */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            ❤️ Top 5 remèdes les plus likés
          </h3>
          {topLikes.length === 0 && <p className="vide">Aucune donnée.</p>}
          {topLikes.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < topLikes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 'bold', color: 'var(--texte-doux)', minWidth: '20px' }}>
                  {i + 1}.
                </span>
                <Link to={`/remedes/${r.id}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.nom_local}
                </Link>
              </div>
              <strong style={{ color: 'var(--rouge)', marginLeft: '0.5rem' }}>❤️ {r.likes}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* --- RÉPARTITIONS --- */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {/* Région */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            📍 Répartition par région
          </h3>
          {parRegion.length === 0 && <p className="vide">Aucune donnée.</p>}
          {parRegion.map((r) => (
            <Barre key={r.region} label={r.region} valeur={r.n} total={totalRegions} />
          ))}
        </div>

        {/* Fiabilité */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            🎚️ Répartition par niveau de fiabilité
          </h3>
          {parFiabilite.length === 0 && <p className="vide">Aucune donnée.</p>}
          {parFiabilite.map((f) => (
            <Barre
              key={f.niveau}
              label={`Niveau ${f.niveau} — ${NIVEAUX[f.niveau] || '?'}`}
              valeur={f.n}
              total={totalFiabilite}
              couleur={`var(--vert)`}
            />
          ))}
        </div>

        {/* Statut */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            📊 Répartition par statut
          </h3>
          {parStatut.length === 0 && <p className="vide">Aucune donnée.</p>}
          {parStatut.map((s) => (
            <Barre
              key={s.statut}
              label={STATUTS[s.statut]?.label || s.statut}
              valeur={s.n}
              total={totalStatut}
              couleur={STATUTS[s.statut]?.couleur || 'var(--texte-doux)'}
            />
          ))}
        </div>
      </section>

      {/* --- ACTIVITÉ RÉCENTE --- */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.2rem' }}>
        {/* Derniers remèdes */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            🆕 Derniers remèdes ajoutés
          </h3>
          {derniers.length === 0 && <p className="vide">Aucun remède.</p>}
          {derniers.map((r) => (
            <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <Link to={`/remedes/${r.id}`} style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.nom_local}
                </Link>
                <span style={{
                  fontSize: '0.75rem',
                  color: STATUTS[r.statut]?.couleur,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  ● {STATUTS[r.statut]?.label}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--texte-doux)' }}>
                📍 {r.region_origine || '—'} · {new Date(r.date_ajout).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>

        {/* Derniers commentaires */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--bordure)' }}>
          <h3 style={{ color: 'var(--vert-fonce)', marginBottom: '1rem', fontSize: '1rem' }}>
            💬 Derniers commentaires publiés
          </h3>
          {derniersCommentaires.length === 0 && <p className="vide">Aucun commentaire.</p>}
          {derniersCommentaires.map((c) => (
            <div key={c.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--texte-doux)' }}>
                <strong>{c.pseudonyme}</strong>
                <span>{new Date(c.date_ajout).toLocaleDateString('fr-FR')}</span>
              </div>
              <p style={{ margin: '0.3rem 0', fontStyle: 'italic' }}>
                « {c.contenu.length > 100 ? c.contenu.slice(0, 100) + '…' : c.contenu} »
              </p>
              <Link to={`/remedes/${c.remede_id}`} style={{ fontSize: '0.8rem' }}>
                🌿 {c.remede_nom}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}