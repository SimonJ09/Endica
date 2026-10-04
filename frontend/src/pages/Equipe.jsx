import { Link } from 'react-router-dom';

const MEMBRES = [
  {
    initiales: 'AJ',
    nom: 'Agohoundjè Jude',
    role: 'Porteur du projet & Développeur',
    bio: "Initiateur de la plateforme Remèdes du terroir. Responsable de la conception technique, du développement et de la coordination du projet.",
    couleur: '#2e7d32',
  },
  {
    initiales: '?',
    nom: 'Référent scientifique',
    role: 'Validation & documentation',
    bio: "Poste à pourvoir. Le référent scientifique sera chargé de la validation des niveaux de fiabilité et de la documentation scientifique.",
    couleur: '#8d6e63',
    ouvert: true,
  },
  {
    initiales: '?',
    nom: 'Documentaliste',
    role: 'Recherche & sources',
    bio: "Poste à pourvoir. Le documentaliste assurera la collecte, l'archivage et la vérification des sources documentaires.",
    couleur: '#8d6e63',
    ouvert: true,
  },
  {
    initiales: '?',
    nom: 'Modérateur·rice',
    role: 'Communauté & modération',
    bio: "Poste à pourvoir. Le modérateur veillera au respect des règles, à la qualité des contributions et au traitement des signalements.",
    couleur: '#8d6e63',
    ouvert: true,
  },
];

export default function Equipe() {
  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Retour à l'accueil
      </Link>

      <h1 style={{ marginTop: '1rem', color: 'var(--vert-fonce)' }}>
        👥 L'équipe du projet
      </h1>
      <p style={{ fontSize: '1.05rem', color: 'var(--texte-doux)', marginBottom: '2rem' }}>
        Remèdes du terroir est un projet collaboratif. Voici les personnes qui
        y contribuent et les rôles ouverts pour la suite.
      </p>

      <div className="grille-equipe">
        {MEMBRES.map((m, i) => (
          <div key={i} className={`membre-carte ${m.ouvert ? 'ouvert' : ''}`}>
            <div
              className="membre-avatar"
              style={{ background: m.couleur }}
            >
              {m.initiales}
            </div>
            <h3>{m.nom}</h3>
            <div className="membre-role">{m.role}</div>
            <p>{m.bio}</p>
            {m.ouvert && (
              <div className="membre-badge">Poste ouvert</div>
            )}
          </div>
        ))}
      </div>

      <section className="section" style={{ marginTop: '3rem' }}>
        <h2>💡 Rejoindre l'équipe</h2>
        <p>
          Nous cherchons des personnes motivées pour enrichir cette base
          documentaire : chercheurs, praticiens, tradithérapeutes, étudiants,
          documentalistes, traducteurs, développeurs…
        </p>
        <p style={{ marginTop: '0.8rem' }}>
          Si vous souhaitez contribuer, écrivez-nous :
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
          <strong>📧 contact@remedes-du-terroir.org</strong>
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <Link to="/a-propos" className="btn">📄 À propos du projet</Link>
          <Link to="/" className="btn secondaire">🏠 Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}