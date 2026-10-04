// Avertissement médical — OBLIGATOIRE (cahier des charges §2)
export default function Avertissement({ compact = false }) {
  if (compact) {
    return (
      <div className="avertissement compact">
        <p>
          <strong>⚠️ Base documentaire.</strong> Ne remplace pas une consultation médicale.
          Consultez un professionnel de santé.
        </p>
      </div>
    );
  }

  return (
    <div className="avertissement">
      <h3>⚠️ Avertissement important</h3>
      <p>
        <strong>Attention — base de données documentaire.</strong>
      </p>
      <p>
        Les informations présentées sur cette plateforme sont fournies à des fins
        documentaires, éducatives, culturelles et scientifiques.
      </p>
      <p>
        La présence d'un remède, d'une plante, d'une préparation ou d'une indication
        dans cette base <strong>ne signifie pas</strong> que son efficacité, son innocuité
        ou sa posologie sont scientifiquement établies.
      </p>
      <p>
        <strong>
          Ne pas utiliser ces informations pour s'automédiquer, modifier un traitement
          médical, remplacer une consultation médicale ou traiter une maladie sans l'avis
          d'un professionnel de santé qualifié.
        </strong>
      </p>
      <p>
        Certaines plantes et préparations peuvent présenter des risques, des effets
        indésirables, des interactions avec des médicaments ou être dangereuses dans
        certaines situations.
      </p>
      <p>En cas de problème de santé, consultez un professionnel de santé.</p>
    </div>
  );
}