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

const LIMITE_AFFICHAGE = 30;

function FiltreBloc({ titre, options, selection, onChange }) {
  const [ouvert, setOuvert] = useState(true);

  return (
    <div className="scholar-filtre">
      <button
        className="scholar-filtre-titre"
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        <span>{titre}</span>
        <span className="scholar-chevron">{ouvert ? '−' : '+'}</span>
      </button>

      {ouvert && (
        <div className="scholar-filtre-options">
          {options.length === 0 && (
            <p className="scholar-filtre-vide">Aucune option.</p>
          )}
          {options.map((opt) => {
            const actif = selection.includes(opt.id);
            return (
              <label key={opt.id} className="scholar-filtre-ligne">
                <input
                  type="checkbox"
                  checked={actif}
                  onChange={() => onChange(opt.id)}
                />
                <span className="scholar-filtre-label">{opt.label}</span>
                <span className="scholar-filtre-count">{opt.count}</span>
              </label>
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

  // Barre locale
  const [recherche, setRecherche] = useState(q);
  // Terme debounced (mis à jour 300ms après la dernière frappe)
  const [rechercheDebounced, setRechercheDebounced] = useState(q);
  const [tri, setTri] = useState('pertinence');

  // ---------- CHARGEMENT DE TOUTES LES DONNÉES EN MÉMOIRE (une fois) ----------
  useEffect(() => {
    let annule = false;
    setChargement(true);

    Promise.all([
      api.get('/remedes', { params: { limit: 200 } }),
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
                ingredients: res.data.ingredients.map((i) => ({
                  id: i.id,
                  nom: i.nom,
                })),
                indications: res.data.indications.map((i) => ({
                  id: i.id,
                  nom: i.nom,
                })),
                description: res.data.description,
                mode_preparation: res.data.mode_preparation,
              }))
            )
          ),
        ]);
      })
      .then(([remedes, ingredients, indications, liaisons]) => {
        if (annule) return;
        setTousIngredients(ingredients);
        setToutesIndications(indications);

        const enrichis = remedes.map((r) => {
          const l = liaisons.find((x) => x.id === r.id);
          return {
            ...r,
            ingredient_ids: (l?.ingredients || []).map((i) => i.id),
            ingredient_noms: (l?.ingredients || []).map((i) => i.nom),
            indication_ids: (l?.indications || []).map((i) => i.id),
            indication_noms: (l?.indications || []).map((i) => i.nom),
            description: l?.description,
            mode_preparation: l?.mode_preparation,
          };
        });
        setTousRemedes(enrichis);
      })
      .catch((err) => {
        console.error(err);
        if (!annule) setErreur('Erreur de chargement.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => { annule = true; };
  }, []);

  // Synchroniser la barre avec l'URL au montage
  useEffect(() => {
    if (q) {
      setRecherche(q);
      setRechercheDebounced(q);
    }
  }, [q]);

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setRechercheDebounced(recherche);
    }, 300);
    return () => clearTimeout(t);
  }, [recherche]);

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

  // ---------- DÉTERMINER SI L'UTILISATEUR A LANCÉ UNE RECHERCHE ----------
  const aCherche =
    rechercheDebounced.trim().length > 0 ||
    filtresIndications.length > 0 ||
    filtresIngredients.length > 0 ||
    filtresRegions.length > 0 ||
    filtresFiabilite.length > 0;

  // ---------- FILTRAGE ----------
  const resultats = useMemo(() => {
    if (!aCherche) return [];

    const terme = rechercheDebounced.trim().toLowerCase();

    let filtres = tousRemedes.filter((r) => {
      if (terme) {
        const hay = [
          r.nom_local,
          r.nom_scientifique,
          r.region_origine,
          r.description,
          ...(r.ingredient_noms || []),
          ...(r.indication_noms || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(terme)) return false;
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

    if (tri === 'recent') {
      filtres.sort((a, b) => (b.date_ajout || '').localeCompare(a.date_ajout || ''));
    } else if (tri === 'fiabilite') {
      filtres.sort((a, b) => b.niveau_fiabilite - a.niveau_fiabilite);
    } else if (tri === 'populaire') {
      filtres.sort((a, b) => (b.vues + b.likes * 5) - (a.vues + a.likes * 5));
    } else {
      filtres.sort((a, b) => {
        if (b.niveau_fiabilite !== a.niveau_fiabilite)
          return b.niveau_fiabilite - a.niveau_fiabilite;
        return b.vues - a.vues;
      });
    }

    return filtres;
  }, [tousRemedes, rechercheDebounced, filtresIndications, filtresIngredients, filtresRegions, filtresFiabilite, tri, aCherche]);

  const resultatsAffiches = resultats.slice(0, LIMITE_AFFICHAGE);
  const resultatsTronques = resultats.length > LIMITE_AFFICHAGE;

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
    setRechercheDebounced('');
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
    <div className="container scholar-container">
      <header className="scholar-header">
        <h1>Explorer la base</h1>
        <p>
          Saisissez un terme ou sélectionnez un filtre pour commencer votre
          recherche parmi les remèdes documentés.
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="scholar-barre-wrap">
        <input
          type="search"
          className="scholar-barre"
          placeholder="Rechercher un remède, une plante, une indication, une région…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          autoFocus
        />
        {recherche && (
          <button
            className="scholar-clear"
            onClick={() => setRecherche('')}
            type="button"
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Layout */}
      <div className="scholar-layout">
        <aside className="scholar-sidebar">
          <div className="scholar-sidebar-header">
            <strong>Affiner la recherche</strong>
            {nombreFiltresActifs > 0 && (
              <button className="btn-lien" onClick={reinitialiser} type="button">
                Tout effacer
              </button>
            )}
          </div>

          <FiltreBloc
            titre="📋 Indications"
            options={optionsIndications}
            selection={filtresIndications}
            onChange={(id) => toggleFiltre(setFiltresIndications, id)}
          />
          <FiltreBloc
            titre="🧪 Ingrédients"
            options={optionsIngredients}
            selection={filtresIngredients}
            onChange={(id) => toggleFiltre(setFiltresIngredients, id)}
          />
          <FiltreBloc
            titre="📍 Régions"
            options={optionsRegions}
            selection={filtresRegions}
            onChange={(id) => toggleFiltre(setFiltresRegions, id)}
          />
          <FiltreBloc
            titre="🎚️ Fiabilité"
            options={optionsFiabilite}
            selection={filtresFiabilite}
            onChange={(id) => toggleFiltre(setFiltresFiabilite, id)}
          />
        </aside>

        <main className="scholar-resultats">
          {/* CAS 1 : L'utilisateur n'a rien cherché → message d'accueil */}
          {!aCherche && (
            <div className="scholar-empty">
              <div className="scholar-empty-icon">🔍</div>
              <h3>Commencez votre recherche</h3>
              <p>
                Saisissez un mot-clé dans la barre ci-dessus ou sélectionnez
                un filtre pour afficher les remèdes correspondants.
              </p>
              <div className="scholar-empty-suggestions">
                <span>Essayez par exemple :</span>
                <button
                  type="button"
                  className="scholar-suggestion"
                  onClick={() => setRecherche('paludisme')}
                >
                  paludisme
                </button>
                <button
                  type="button"
                  className="scholar-suggestion"
                  onClick={() => setRecherche('neem')}
                >
                  neem
                </button>
                <button
                  type="button"
                  className="scholar-suggestion"
                  onClick={() => setRecherche('toux')}
                >
                  toux
                </button>
                <button
                  type="button"
                  className="scholar-suggestion"
                  onClick={() => setRecherche('fièvre')}
                >
                  fièvre
                </button>
              </div>
            </div>
          )}

          {/* CAS 2 : Recherche lancée mais aucun résultat */}
          {aCherche && resultats.length === 0 && (
            <div className="vide">
              <p>Aucun remède ne correspond à vos critères.</p>
              <button
                className="btn secondaire"
                onClick={reinitialiser}
                style={{ marginTop: '0.8rem' }}
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* CAS 3 : Résultats */}
          {aCherche && resultats.length > 0 && (
            <>
              <div className="scholar-resultats-header">
                <div>
                  <strong>
                    {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
                  </strong>
                  {nombreFiltresActifs > 0 && (
                    <span className="scholar-filtres-actifs">
                      {' '}· {nombreFiltresActifs} filtre{nombreFiltresActifs > 1 ? 's' : ''} actif{nombreFiltresActifs > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="scholar-tri">
                  <label htmlFor="tri">Trier par :</label>
                  <select
                    id="tri"
                    value={tri}
                    onChange={(e) => setTri(e.target.value)}
                  >
                    <option value="pertinence">Pertinence</option>
                    <option value="fiabilite">Niveau de fiabilité</option>
                    <option value="recent">Plus récents</option>
                    <option value="populaire">Plus consultés</option>
                  </select>
                </div>
              </div>

              <div className="scholar-liste">
                {resultatsAffiches.map((r) => (
                  <article key={r.id} className="scholar-item">
                    <div className="scholar-item-header">
                      <Link to={`/remedes/${r.id}`} className="scholar-item-titre">
                        {r.nom_local}
                      </Link>
                      {r.nom_scientifique && (
                        <span className="scholar-item-scientifique">
                          {r.nom_scientifique}
                        </span>
                      )}
                    </div>

                    <div className="scholar-item-meta">
                      <span className={`badge n${r.niveau_fiabilite}`}>
                        {NIVEAUX[r.niveau_fiabilite]}
                      </span>
                      <span>📍 {r.region_origine || 'Région non précisée'}</span>
                      <span>👁 {r.vues}</span>
                      <span>❤️ {r.likes}</span>
                    </div>

                    {r.description && (
                      <p className="scholar-item-desc">
                        {r.description.length > 220
                          ? r.description.slice(0, 220) + '…'
                          : r.description}
                      </p>
                    )}

                    {(r.indication_noms?.length > 0 || r.ingredient_noms?.length > 0) && (
                      <div className="scholar-item-tags">
                        {r.indication_noms?.slice(0, 3).map((nom, i) => (
                          <Link
                            key={`ind-${i}`}
                            to={`/indications/${r.indication_ids[i]}`}
                            className="tag tag-indication"
                          >
                            📋 {nom}
                          </Link>
                        ))}
                        {r.ingredient_noms?.slice(0, 4).map((nom, i) => (
                          <Link
                            key={`ing-${i}`}
                            to={`/ingredients/${r.ingredient_ids[i]}`}
                            className="tag tag-ingredient"
                          >
                            🧪 {nom}
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="scholar-item-actions">
                      <Link to={`/remedes/${r.id}`} className="scholar-item-lien">
                        Consulter la fiche →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {resultatsTronques && (
                <div className="scholar-plus">
                  <p>
                    Seuls les <strong>{LIMITE_AFFICHAGE}</strong> premiers
                    résultats sont affichés sur <strong>{resultats.length}</strong>.
                  </p>
                  <p className="scholar-plus-hint">
                    💡 Précisez votre recherche ou ajoutez un filtre pour
                    affiner les résultats.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}