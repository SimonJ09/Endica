import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

const NIVEAUX = {
  1: 'Non vérifié',
  2: 'Témoignage',
  3: 'Documenté',
  4: 'Données scientifiques',
  5: 'Validation scientifique',
};

function BadgeFiabilite({ niveau }) {
  return <span className={`badge n${niveau}`}>{NIVEAUX[niveau] || 'N/A'}</span>;
}

function FiltreBloc({ titre, emoji, options, selection, onChange, ouvertParDefaut = true }) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);

  return (
    <div className="filtre-bloc">
      <button
        className="filtre-titre"
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        <span>{emoji} {titre}</span>
        <span className={`filtre-chevron ${ouvert ? 'ouvert' : ''}`}>›</span>
      </button>

      {ouvert && (
        <div className="filtre-options">
          {options.length === 0 && (
            <p className="filtre-vide">Aucune option.</p>
          )}
          {options.map((opt) => {
            const actif = selection.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={`filtre-pill ${actif ? 'actif' : ''}`}
                onClick={() => onChange(opt.id)}
              >
                <span className="filtre-pill-label">{opt.label}</span>
                <span className="filtre-pill-count">{opt.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Recherche() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';

  const [tousRemedes, setTousRemedes] = useState([]);
  const [tousIngredients, setTousIngredients] = useState([]);
  const [toutesIndications, setToutesIndications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [filtresIndications, setFiltresIndications] = useState([]);
  const [filtresIngredients, setFiltresIngredients] = useState([]);
  const [filtresRegions, setFiltresRegions] = useState([]);
  const [filtresFiabilite, setFiltresFiabilite] = useState([]);

  // La barre locale est initialisée depuis l'URL UNE FOIS au montage
  const [recherche, setRecherche] = useState(q);

  // ---------- CHARGEMENT ----------
  useEffect(() => {
    let annule = false;
    setChargement(true);

    Promise.all([
      api.get('/remedes', { params: { limit: 100 } }),
      api.get('/ingredients'),
      api.get('/indications'),
    ])
      .then(([resR, resI, resInd]) => {
        if (annule) return;
        return Promise.all([
          Promise.resolve(resR.data.remedes),
          Promise.resolve(resI.data.ingredients),
          Promise.resolve(resInd.data.indications),
          Promise.all(
            resR.data.remedes.map((r) =>
              api.get(`/remedes/${r.id}`).then((res) => ({
                id: r.id,
                ingredients: res.data.ingredients.map((i) => i.id),
                indications: res.data.indications.map((i) => i.id),
              }))
            )
          ),
        ]);
      })
      .then(([remedes, ingredients, indications, liaisons]) => {
        if (annule) return;
        setTousIngredients(ingredients);
        setToutesIndications(indications);

        const remedesEnrichis = remedes.map((r) => {
          const liaison = liaisons.find((l) => l.id === r.id);
          return {
            ...r,
            ingredient_ids: liaison?.ingredients || [],
            indication_ids: liaison?.indications || [],
          };
        });
        setTousRemedes(remedesEnrichis);
      })
      .catch((err) => {
        console.error(err);
        if (!annule) setErreur('Erreur de chargement des données.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => { annule = true; };
  }, []);

  // Si l'utilisateur arrive avec un ?q=..., on le met dans la barre
  useEffect(() => {
    if (q) setRecherche(q);
  }, [q]);

  // ---------- OPTIONS DE FILTRES ----------
  const optionsIndications = useMemo(() =>
    toutesIndications
      .map((ind) => ({
        id: ind.id,
        label: ind.nom,
        count: tousRemedes.filter((r) => r.indication_ids?.includes(ind.id)).length,
      }))
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count),
  [toutesIndications, tousRemedes]);

  const optionsIngredients = useMemo(() =>
    tousIngredients
      .map((ing) => ({
        id: ing.id,
        label: ing.nom,
        count: tousRemedes.filter((r) => r.ingredient_ids?.includes(ing.id)).length,
      }))
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count),
  [tousIngredients, tousRemedes]);

  const optionsRegions = useMemo(() => {
    const map = {};
    for (const r of tousRemedes) {
      const reg = r.region_origine || 'Non précisée';
      map[reg] = (map[reg] || 0) + 1;
    }
    return Object.entries(map)
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((a, b) => b.count - a.count);
  }, [tousRemedes]);

  const optionsFiabilite = useMemo(() => {
    const map = {};
    for (const r of tousRemedes) {
      map[r.niveau_fiabilite] = (map[r.niveau_fiabilite] || 0) + 1;
    }
    return [1, 2, 3, 4, 5]
      .filter((n) => map[n] > 0)
      .map((n) => ({ id: n, label: `Niveau ${n} — ${NIVEAUX[n]}`, count: map[n] }));
  }, [tousRemedes]);

  // ---------- FILTRAGE EN TEMPS RÉEL ----------
  const resultats = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return tousRemedes.filter((r) => {
      if (terme) {
        const haystack = [r.nom_local, r.nom_scientifique, r.region_origine]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(terme)) return false;
      }

      if (filtresIndications.length > 0) {
        if (!filtresIndications.some((id) => r.indication_ids?.includes(id))) return false;
      }

      if (filtresIngredients.length > 0) {
        if (!filtresIngredients.some((id) => r.ingredient_ids?.includes(id))) return false;
      }

      if (filtresRegions.length > 0) {
        const reg = r.region_origine || 'Non précisée';
        if (!filtresRegions.includes(reg)) return false;
      }

      if (filtresFiabilite.length > 0) {
        if (!filtresFiabilite.includes(r.niveau_fiabilite)) return false;
      }

      return true;
    });
  }, [tousRemedes, recherche, filtresIndications, filtresIngredients, filtresRegions, filtresFiabilite]);

  // ---------- ACTIONS ----------
  const toggleFiltre = (setter, id) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const reinitialiser = () => {
    setFiltresIndications([]);
    setFiltresIngredients([]);
    setFiltresRegions([]);
    setFiltresFiabilite([]);
    setRecherche('');
    setParams({});
  };

  const nombreFiltresActifs =
    filtresIndications.length +
    filtresIngredients.length +
    filtresRegions.length +
    filtresFiabilite.length;

  // ---------- RENDU ----------
  if (chargement) {
    return <div className="container chargement">Chargement des données…</div>;
  }

  if (erreur) {
    return <div className="container erreur">{erreur}</div>;
  }

  return (
    <div className="container recherche-container">
      <header className="recherche-header">
        <h1>🔍 Explorer la base</h1>
        <p>Recherchez et filtrez parmi les remèdes documentés.</p>
      </header>

      {/* ---------- BARRE DE RECHERCHE ---------- */}
      <div className="recherche-barre-wrap">
        <input
          type="search"
          className="recherche-barre"
          placeholder="Rechercher par nom, plante, région…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        {recherche && (
          <button
            className="recherche-clear"
            onClick={() => setRecherche('')}
            type="button"
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ---------- LAYOUT ---------- */}
      <div className="recherche-layout">
        {/* SIDEBAR */}
        <aside className="recherche-filtres">
          <div className="filtres-header">
            <strong>Filtres</strong>
            {nombreFiltresActifs > 0 && (
              <button className="btn-lien" onClick={reinitialiser} type="button">
                Tout effacer
              </button>
            )}
          </div>

          <FiltreBloc
            titre="Indications"
            emoji="📋"
            options={optionsIndications}
            selection={filtresIndications}
            onChange={(id) => toggleFiltre(setFiltresIndications, id)}
          />
          <FiltreBloc
            titre="Ingrédients"
            emoji="🧪"
            options={optionsIngredients}
            selection={filtresIngredients}
            onChange={(id) => toggleFiltre(setFiltresIngredients, id)}
          />
          <FiltreBloc
            titre="Régions"
            emoji="📍"
            options={optionsRegions}
            selection={filtresRegions}
            onChange={(id) => toggleFiltre(setFiltresRegions, id)}
          />
          <FiltreBloc
            titre="Fiabilité"
            emoji="🎚️"
            options={optionsFiabilite}
            selection={filtresFiabilite}
            onChange={(id) => toggleFiltre(setFiltresFiabilite, id)}
          />
        </aside>

        {/* RÉSULTATS */}
        <main className="recherche-resultats">
          <div className="resultats-header">
            <strong>
              {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
            </strong>
            {nombreFiltresActifs > 0 && (
              <div className="filtres-actifs">
                {filtresIndications.length + filtresIngredients.length + filtresRegions.length + filtresFiabilite.length > 0 && (
                  <button className="btn-lien" onClick={reinitialiser} type="button">
                    Réinitialiser
                  </button>
                )}
              </div>
            )}
          </div>

          {resultats.length === 0 && (
            <div className="vide">
              <p>Aucun remède ne correspond à vos critères.</p>
              <button className="btn secondaire" onClick={reinitialiser}>
                Réinitialiser les filtres
              </button>
            </div>
          )}

          <div className="grille">
            {resultats.map((r) => (
              <Link to={`/remedes/${r.id}`} key={r.id} className="carte">
                <h3>{r.nom_local}</h3>
                {r.nom_scientifique && (
                  <p className="scientifique">{r.nom_scientifique}</p>
                )}
                <BadgeFiabilite niveau={r.niveau_fiabilite} />
                <div className="meta">
                  <span>📍 {r.region_origine || 'Région non précisée'}</span>
                  <span>👁 {r.vues} · ❤️ {r.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}