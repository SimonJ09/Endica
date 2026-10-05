import { Link } from 'react-router-dom';

const MEMBRES = [
  {
    initiales: 'AJ',
    nom: 'Agohoundjè Jude',
    role: 'Concepteur de la plateforme',
    bio:
      " Responsable de la conception technique, du développement de la plateforme et de la mise en place de la base de données documentaire.",
    couleur: '#2e7d32',
    badge: 'Porteur du projet',
  },
  {
    initiales: 'DO',
    nom: 'Dr Odjo',
    role: 'Référent scientifique',
    bio:
      "Initiateur et concepteur du projet, Professeur de Sciences de la Vie et de la Terre. Chargé de l'épuration de la base documentaire et de son enrichissement avec des données scientifiques vérifiées, en veillant à la rigueur et à la fiabilité des informations.",
    couleur: '#1565c0',
    badge: 'Référent scientifique',
  },
  {
    initiales: '?',
    nom: 'Poste ouvert',
    role: 'Documentaliste / Recherche',
    bio:
      "Nous recherchons une personne pour assurer la collecte, l'archivage et la vérification des sources documentaires, ainsi que la recherche bibliographique.",
    couleur: '#8d6e63',
    ouvert: true,
  },
  {
    initiales: '?',
    nom: 'Poste ouvert',
    role: 'Modérateur·rice',
    bio:
      "Nous recherchons une personne pour veiller au respect des règles, à la qualité des contributions et au traitement des signalements.",
    couleur: '#8d6e63',
    ouvert: true,
  },
];

export default function Equipe() {
  return (
    <div className="equipe-page">
      {/* ---------- HERO ---------- */}
      <section className="equipe-hero">
        <div className="container">
          <span className="equipe-eyebrow">👥 L'équipe</span>
          <h1>
            Un projet porté par des <span className="accent">passions</span>
            <br />
            et une exigence <span className="accent">scientifique</span>.
          </h1>
          <p className="equipe-lead">
            Remèdes du terroir est un projet collaboratif qui rassemble des
            compétences complémentaires : conception technique, expertise
            scientifique, documentation et modération.
          </p>
        </div>
      </section>

      {/* ---------- MEMBRES ---------- */}
      <section className="section">
        <div className="container">
          <h2 className="equipe-h2 center">Les membres du projet</h2>

          <div className="membres-grille">
            {MEMBRES.map((m, i) => (
              <div
                key={i}
                className={`membre ${m.ouvert ? 'membre-ouvert' : ''}`}
              >
                <div
                  className="membre-avatar"
                  style={{ background: m.couleur }}
                >
                  {m.initiales}
                </div>

                <h3 className="membre-nom">{m.nom}</h3>

                <div className="membre-role">{m.role}</div>

                {m.badge && !m.ouvert && (
                  <span className="membre-badge-officiel">{m.badge}</span>
                )}

                {m.ouvert && (
                  <span className="membre-badge-ouvert">Poste ouvert</span>
                )}

                <p className="membre-bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- NOTRE MISSION COMMUNE ---------- */}
      <section className="section equipe-section-alt">
        <div className="container equipe-narrow">
          <h2 className="equipe-h2 center">Notre mission commune</h2>
          <p className="equipe-para">
            Notre ambition est simple : offrir à chacun — chercheurs, étudiants,
            praticiens, grand public — un accès structuré, rigoureux et
            transparent aux connaissances sur les remèdes endogènes.
          </p>
          <p className="equipe-para">
            La plateforme est conçue pour être <strong>évolutive</strong> :
            chaque contributeur peut enrichir la base, mais toujours dans le
            respect d'une méthodologie claire qui distingue le témoignage de
            la preuve scientifique.
          </p>
        </div>
      </section>

      {/* ---------- REJOINDRE ---------- */}
      <section className="section equipe-contribuer">
        <div className="container equipe-narrow center">
          <h2 className="equipe-h2">Rejoindre l'équipe</h2>
          <p className="equipe-sub">
            Vous êtes chercheur, praticien, tradithérapeute, étudiant,
            documentaliste, traducteur ou développeur ? Vous souhaitez
            contribuer à enrichir cette base documentaire ?
          </p>
          <p className="equipe-sub">
            <strong>Nous sommes à la recherche de nouveaux membres.</strong>
          </p>
          <div className="equipe-actions">
            <a href="mailto:contact@remedes-du-terroir.org" className="btn">
              ✉️ Nous écrire
            </a>
            <Link to="/a-propos" className="btn secondaire">
              📄 À propos du projet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}