export default function Logo({ taille = 40, couleur = '#ffffff', avecTexte = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <svg
        width={taille}
        height={taille}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Remèdes du terroir"
      >
        {/* Cercle extérieur */}
        <circle cx="32" cy="32" r="30" fill="none" stroke={couleur} strokeWidth="2.5" />

        {/* Feuille principale (côté gauche) */}
        <path
          d="M32 50 C 20 46, 14 34, 18 22 C 26 22, 34 28, 34 38 C 34 44, 33 47, 32 50 Z"
          fill={couleur}
          opacity="0.9"
        />

        {/* Feuille secondaire (côté droit) */}
        <path
          d="M32 50 C 44 46, 50 34, 46 22 C 38 22, 30 28, 30 38 C 30 44, 31 47, 32 50 Z"
          fill={couleur}
          opacity="0.6"
        />

        {/* Nervure centrale */}
        <line x1="32" y1="22" x2="32" y2="50" stroke={couleur} strokeWidth="1.2" opacity="0.7" />

        {/* Petite tige */}
        <line x1="32" y1="50" x2="32" y2="56" stroke={couleur} strokeWidth="2" strokeLinecap="round" />
      </svg>

      {avecTexte && (
        <span
          style={{
            color: couleur,
            fontWeight: 700,
            fontSize: '1.15rem',
            letterSpacing: '0.3px',
            lineHeight: 1.1,
          }}
        >
          Remèdes
          <br />
          <span style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.85 }}>
            du terroir
          </span>
        </span>
      )}
    </div>
  );
}