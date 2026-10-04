import { Link } from 'react-router-dom';
import Avertissement from '../components/Avertissement';

export default function APropos() {
  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Retour à l'accueil
      </Link>

      <h1 style={{ marginTop: '1rem', color: 'var(--vert-fonce)' }}>
        📄 À propos du projet
      </h1>
      <p style={{ fontSize: '1.05rem', color: 'var(--texte-doux)', marginBottom: '2rem' }}>
        Remèdes du terroir est une plateforme web publique destinée à centraliser
        et organiser les informations disponibles sur les remèdes endogènes et
        les plantes médicinales.
      </p>

      <section className="section">
        <h2>🎯 Notre vision</h2>
        <p>
          Créer une base de données documentaire publique, structurée et évolutive,
          permettant de <strong>conserver</strong>, <strong>documenter</strong> et
          <strong> valoriser</strong> les connaissances traditionnelles liées aux
          remèdes endogènes.
        </p>
        <p style={{ marginTop: '0.8rem' }}>
          Elle s'adresse au public, aux étudiants, aux chercheurs et aux
          professionnels intéressés par ces savoirs.
        </p>
      </section>

      <section className="section">
        <h2>⚠️ Ce que ce site N'EST PAS</h2>
        <p>
          Cette plateforme <strong>n'est pas</strong> un service de diagnostic
          médical, de prescription ou de consultation médicale.
        </p>
        <p style={{ marginTop: '0.8rem' }}>
          La présence d'un remède, d'une plante ou d'une préparation dans la
          base ne signifie pas que son efficacité, son innocuité ou sa posologie
          sont scientifiquement établies.
        </p>
        <Avertissement />
      </section>

      <section className="section">
        <h2>🎚️ Méthodologie : les 5 niveaux de fiabilité</h2>
        <p style={{ marginBottom: '1rem' }}>
          Chaque information est associée à un niveau clairement visible afin
          d'éviter toute confusion entre témoignage et preuve scientifique.
        </p>

        <div className="niveaux-liste">
          <div className="niveau-item n1">
            <div className="niveau-num">1</div>
            <div>
              <strong>Non vérifié</strong>
              <p>Information enregistrée mais non vérifiée.</p>
            </div>
          </div>
          <div className="niveau-item n2">
            <div className="niveau-num">2</div>
            <div>
              <strong>Témoignage</strong>
              <p>Information provenant d'un témoignage ou d'une transmission traditionnelle.</p>
            </div>
          </div>
          <div className="niveau-item n3">
            <div className="niveau-num">3</div>
            <div>
              <strong>Documenté</strong>
              <p>Information retrouvée dans des documents ou publications.</p>
            </div>
          </div>
          <div className="niveau-item n4">
            <div className="niveau-num">4</div>
            <div>
              <strong>Données scientifiques disponibles</strong>
              <p>Des données scientifiques existent et sont documentées.</p>
            </div>
          </div>
          <div className="niveau-item n5">
            <div className="niveau-num">5</div>
            <div>
              <strong>Validation scientifique</strong>
              <p>
                L'équipe scientifique du projet a identifié des éléments
                permettant de considérer l'information comme scientifiquement
                validée selon les critères définis par le projet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>📚 Sources et traçabilité</h2>
        <ul style={{ paddingLeft: '1.2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Chaque information importante est associée à sa source lorsque
            celle-ci est connue.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Les modifications sont enregistrées et tracées.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Les publications scientifiques, documents et médias sont référencés
            avec leurs auteurs et leurs droits d'utilisation.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Un système de signalement permet à tout utilisateur de nous alerter
            sur une information incorrecte ou dangereuse.
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>✉️ Nous contacter</h2>
        <p>
          Pour toute question, suggestion, contribution ou signalement, écrivez-nous à :
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
          <strong>📧 contact@remedes-du-terroir.org</strong>
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/equipe">→ Voir l'équipe du projet</Link>
        </p>
      </section>
    </div>
  );
}