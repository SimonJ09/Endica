# CAHIER DES CHARGES
# REMÈDES DU TERROIR

## Plateforme publique de documentation, de recherche et de valorisation des connaissances sur les remèdes endogènes

**Porteur du projet :** Jude  
**Version :** 2.0  
**Type :** Plateforme web publique  
**Objectif :** Base de données documentaire publique sur les remèdes endogènes

---

# 1. VISION DU PROJET

**Remèdes du terroir** est une plateforme web publique destinée à centraliser et organiser les informations disponibles sur les remèdes endogènes et les plantes médicinales.

La plateforme doit permettre au public, aux étudiants, aux chercheurs et aux professionnels intéressés de rechercher et consulter des informations structurées provenant de différentes sources.

Elle doit notamment permettre de retrouver :

- les remèdes associés à une indication ;
- les remèdes utilisant un ingrédient donné ;
- les plantes ou substances utilisées ;
- les parties utilisées ;
- les modes de préparation rapportés ;
- les régions associées ;
- les témoignages ;
- les documents scientifiques ;
- les articles ;
- les documents PDF ;
- les photos ;
- les vidéos ;
- les niveaux de fiabilité des informations.

La plateforme constitue avant tout **une base de données documentaire publique**.

Elle ne constitue pas un service de diagnostic médical, de prescription ou de consultation médicale.

---

# 2. AVERTISSEMENT DE SÉCURITÉ

Un avertissement très visible devra être présent sur la plateforme.

## AVERTISSEMENT IMPORTANT

> **ATTENTION — BASE DE DONNÉES DOCUMENTAIRE**
>
> Les informations présentées sur cette plateforme sont fournies à des fins documentaires, éducatives, culturelles et scientifiques.
>
> La présence d'un remède, d'une plante, d'une préparation ou d'une indication dans cette base ne signifie pas que son efficacité, son innocuité ou sa posologie sont scientifiquement établies.
>
> **Ne pas utiliser ces informations pour s'automédiquer, modifier un traitement médical, remplacer une consultation médicale ou traiter une maladie sans l'avis d'un professionnel de santé qualifié.**
>
> Certaines plantes et préparations peuvent présenter des risques, des effets indésirables, des interactions avec des médicaments ou être dangereuses dans certaines situations.
>
> En cas de problème de santé, consultez un professionnel de santé.

Cet avertissement devra être particulièrement visible :

- sur la page d'accueil ;
- sur les fiches de remèdes ;
- sur les pages de recherche ;
- à proximité des informations de préparation ou de posologie ;
- dans le pied de page.

---

# 3. OBJECTIFS

## 3.1. Objectif général

Créer une base de données publique, structurée et évolutive permettant de documenter les connaissances relatives aux remèdes endogènes.

## 3.2. Objectifs spécifiques

La plateforme doit permettre de :

1. centraliser les données ;
2. faciliter la recherche ;
3. relier les remèdes à leurs ingrédients ;
4. relier les remèdes aux indications rapportées ;
5. conserver les sources ;
6. associer des photos et vidéos aux fiches ;
7. associer des publications scientifiques ;
8. conserver des documents PDF ;
9. distinguer témoignage et preuve scientifique ;
10. permettre aux utilisateurs de commenter avec un pseudonyme ;
11. permettre les likes ;
12. compter les consultations ;
13. modérer les contributions ;
14. assurer la traçabilité des données ;
15. permettre l'exploitation scientifique future de la base.

---

# 4. TYPES DE RECHERCHE

La recherche constitue une fonctionnalité centrale.

## 4.1. Recherche générale

Une barre de recherche principale permettra de rechercher par mots-clés.

Exemple :

```text
Recherche : neem
```

Résultats pouvant correspondre à :

- nom local ;
- nom scientifique ;
- ingrédient ;
- indication ;
- région ;
- contenu documentaire.

---

# 5. RECHERCHE PAR MALADIE OU INDICATION

L'utilisateur pourra rechercher une indication.

Exemple :

```text
Palu
```

Le système devra identifier les remèdes associés à cette indication et afficher les fiches correspondantes.

Exemple :

```text
Recherche : palu

Résultats :

Remède A
Remède B
Remède C
Remède D
...
```

Cependant, l'interface devra utiliser une formulation prudente.

Il sera préférable d'afficher :

**« Remèdes traditionnellement rapportés pour cette indication »**

plutôt que :

**« Remèdes qui guérissent le paludisme »**

La plateforme ne devra jamais transformer automatiquement une indication traditionnelle en affirmation d'efficacité médicale.

---

# 6. RECHERCHE PAR INGREDIENT

Cette fonctionnalité constitue une fonctionnalité majeure.

Exemple :

```text
Recherche d'ingrédient :
feuille de neem
```

Le système devra retourner **tous les remèdes utilisant cet ingrédient**.

Exemple :

```text
INGRÉDIENT : Feuille de neem

Remèdes associés :

1. Préparation A
   → Indication rapportée : ...

2. Préparation B
   → Indication rapportée : ...

3. Préparation C
   → Indication rapportée : ...
```

Il devra également être possible d'accéder à la fiche de l'ingrédient.

---

# 7. NOUVEAU MODÈLE DE DONNÉES

Le modèle initial `remedes` devra évoluer.

## 7.1. Table `remedes`

| Champ | Description |
|---|---|
| id | Identifiant |
| nom_local | Nom vernaculaire |
| nom_scientifique | Nom scientifique |
| description | Description générale |
| indication | Indication rapportée |
| mode_preparation | Mode de préparation rapporté |
| posologie | Information disponible |
| region_origine | Région |
| niveau_fiabilite | Niveau de fiabilité |
| statut | État de publication |
| vues | Nombre de consultations |
| likes | Nombre de likes |
| ajoute_par | Auteur |
| modifie_par | Dernier modificateur |
| date_ajout | Date de création |
| date_modification | Date de modification |

---

# 8. TABLE `ingredients`

Afin de permettre une véritable recherche par ingrédient, les ingrédients doivent être séparés des remèdes.

| Champ | Description |
|---|---|
| id | Identifiant |
| nom | Nom de l'ingrédient |
| nom_local | Nom local |
| nom_scientifique | Nom scientifique |
| description | Description |
| partie_utilisee | Partie concernée |
| source | Source |
| date_creation | Date |

---

# 9. RELATION REMÈDES / INGREDIENTS

Un remède peut utiliser plusieurs ingrédients.

Un ingrédient peut apparaître dans plusieurs remèdes.

Il faut donc utiliser une table intermédiaire :

### `remede_ingredients`

| Champ | Description |
|---|---|
| remede_id | Identifiant du remède |
| ingredient_id | Identifiant de l'ingrédient |
| quantite | Quantité lorsqu'elle est documentée |
| unite | Unité |
| ordre | Ordre de présentation |

Relation :

```text
INGRÉDIENT
     │
     ├── Remède A
     ├── Remède B
     ├── Remède C
     └── Remède D
```

---

# 10. INDICATIONS / MALADIES

Il est également recommandé de ne pas stocker toutes les indications uniquement sous forme de texte.

Créer une table :

### `indications`

| Champ | Description |
|---|---|
| id | Identifiant |
| nom | Nom de l'indication |
| description | Description |
| synonymes | Termes associés |
| type | Catégorie |

Puis une relation :

### `remede_indications`

| Champ | Description |
|---|---|
| remede_id | Remède |
| indication_id | Indication |

Cela permettra par exemple :

```text
PALUDISME
   ↓
Remède A
Remède B
Remède C
Remède D
```

---

# 11. PHOTOS

Chaque remède pourra posséder plusieurs photos.

Créer une table :

### `media`

| Champ | Description |
|---|---|
| id | Identifiant |
| remede_id | Remède associé |
| type | image / video |
| url | Adresse du média |
| titre | Titre |
| description | Description |
| source | Source |
| auteur | Auteur |
| statut | Validé / en attente |
| date_ajout | Date |

Les images devront être accompagnées de leur source lorsque celle-ci est connue.

---

# 12. VIDÉOS

Une fiche pourra également contenir une ou plusieurs vidéos.

Exemples :

- présentation d'une plante ;
- entretien avec un praticien traditionnel ;
- documentation de terrain ;
- démonstration documentaire de préparation ;
- conférence ;
- contenu scientifique.

Les vidéos pourront être :

- hébergées sur une plateforme externe ;
- ou stockées sur le serveur lorsque cela est techniquement approprié.

Toute vidéo devra respecter les droits d'utilisation et de diffusion.

---

# 13. DOCUMENTS SCIENTIFIQUES

Chaque remède pourra être associé à des références scientifiques.

Créer une table :

### `sources_scientifiques`

| Champ | Description |
|---|---|
| id | Identifiant |
| remede_id | Remède |
| titre | Titre de la publication |
| auteurs | Auteurs |
| année | Année |
| revue | Revue |
| doi | DOI si disponible |
| url | Lien |
| resume | Résumé/documentation |
| fichier_pdf | PDF lorsque sa diffusion est autorisée |
| type | Article / thèse / rapport / ouvrage |
| date_ajout | Date |

---

# 14. GESTION DES PDF

La plateforme pourra conserver ou référencer :

- articles scientifiques ;
- thèses ;
- mémoires ;
- rapports ;
- documents institutionnels ;
- publications ;
- enquêtes.

### Attention aux droits d'auteur

Un PDF ne devra être hébergé directement sur la plateforme que si sa diffusion est autorisée.

Lorsque ce n'est pas le cas, la plateforme devra plutôt conserver :

- le titre ;
- les auteurs ;
- la référence ;
- le DOI ;
- le lien officiel ;
- éventuellement le résumé.

---

# 15. NIVEAU DE FIABILITÉ

Chaque information devra être associée à un niveau clairement visible.

## Niveau 1 — Non vérifié

Information enregistrée mais non vérifiée.

## Niveau 2 — Témoignage

Information provenant d'un témoignage ou d'une transmission traditionnelle.

## Niveau 3 — Documenté

Information retrouvée dans des documents ou publications.

## Niveau 4 — Données scientifiques disponibles

Des données scientifiques existent et sont documentées.

## Niveau 5 — Validation scientifique

L'équipe scientifique du projet a identifié des éléments permettant de considérer l'information comme scientifiquement validée selon les critères définis par le projet.

La plateforme devra éviter toute confusion entre ces niveaux.

---

# 16. STATISTIQUES DE CONSULTATION

Chaque fiche pourra compter :

- nombre de vues ;
- nombre de likes ;
- nombre de partages, si cette fonctionnalité est ajoutée ;
- date de dernière consultation.

Exemple :

```text
👁 1 248 consultations
❤️ 87 likes
```

Les statistiques devront être utilisées à des fins informatives et ne devront jamais être interprétées comme une preuve d'efficacité.

---

# 17. SYSTÈME DE LIKES

Un utilisateur pourra indiquer qu'il apprécie ou trouve intéressante une fiche.

Exemple :

```text
❤️ 125
```

Le système devra éviter autant que possible les likes artificiellement répétés.

Selon l'évolution du projet, le like pourra être associé :

- à un compte ;
- ou à un mécanisme technique permettant de limiter les répétitions.

Le nombre de likes ne devra jamais être présenté comme un indicateur d'efficacité médicale.

---

# 18. COMMENTAIRES

Les utilisateurs pourront commenter une fiche.

Ils pourront utiliser un **pseudonyme**.

Exemple :

```text
Koffi_23

« Ma grand-mère utilisait cette plante dans notre village. »

❤️ 12
```

Le système devra prévoir :

- pseudonyme ;
- commentaire ;
- date ;
- statut ;
- possibilité de modération ;
- signalement.

---

# 19. MODÉRATION DES COMMENTAIRES

Les commentaires ne devront pas être publiés sans contrôle approprié.

Un commentaire pourra avoir les statuts :

```text
en_attente
publie
rejete
masque
```

Les administrateurs pourront :

- approuver ;
- masquer ;
- supprimer ;
- examiner les commentaires signalés.

Les commentaires ne devront pas permettre :

- les insultes ;
- les contenus dangereux ;
- les fausses affirmations présentées comme des certitudes médicales ;
- la publicité abusive ;
- le spam ;
- les informations personnelles sensibles.

---

# 20. SIGNALEMENT

Un utilisateur pourra signaler :

- un commentaire ;
- une information ;
- une photo ;
- une vidéo ;
- une source ;
- une fiche.

Exemples de motifs :

```text
Information incorrecte
Information dangereuse
Source incorrecte
Contenu inapproprié
Problème de droits
Autre
```

Les signalements seront visibles dans l'espace administrateur.

---

# 21. FICHE COMPLÈTE D'UN REMÈDE

La fiche pourra être organisée ainsi :

```text
------------------------------------------------
NOM DU REMÈDE

⚠️ AVERTISSEMENT
Base documentaire — ne constitue pas une prescription.

Niveau de fiabilité : TÉMOIGNAGE

📷 Photos

📝 Description

🌿 Ingrédients
   - Ingrédient A
   - Ingrédient B

🌱 Parties utilisées

📍 Région

📋 Indications rapportées

⚗️ Mode de préparation rapporté

⚠️ Posologie
   Information non validée / source disponible

📚 Sources scientifiques

📄 Documents

🎥 Vidéos

👁 Consultations
❤️ Likes

💬 Commentaires
------------------------------------------------
```

---

# 22. RECHERCHE AVANCÉE

La plateforme devra proposer une recherche avancée permettant de combiner plusieurs critères.

Exemple :

```text
Ingrédient : Neem
Indication : Paludisme
Région : Atlantique
Fiabilité : Littérature
```

Résultat :

```text
Remèdes correspondant à ces critères : 7
```

---

# 23. SUGGESTIONS AUTOMATIQUES

Lorsqu'un utilisateur commence une recherche, le système pourra proposer :

```text
Recherche : palu

Suggestions :

Paludisme
Remèdes associés au paludisme
Plantes associées
Articles scientifiques
```

De même :

```text
Recherche : neem

Suggestions :

Neem
Azadirachta indica
Feuille de neem
Écorce de neem
```

---

# 24. CATÉGORIES

Les remèdes pourront être classés selon plusieurs catégories documentaires.

Exemples :

- plantes ;
- préparations à base de plantes ;
- produits animaux ;
- minéraux ;
- autres ressources naturelles.

Une même donnée pourra appartenir à plusieurs catégories lorsque cela est pertinent.

---

# 25. ADMINISTRATION

Le tableau de bord administrateur devra permettre de gérer :

```text
📊 Tableau de bord

🌿 Remèdes
🧪 Ingrédients
🦠 Indications
📚 Sources scientifiques
📷 Photos
🎥 Vidéos
📄 Documents
💬 Commentaires
🚨 Signalements
👥 Administrateurs
📋 Journal d'activité
```

---

# 26. TABLEAU DE BORD — STATISTIQUES

Le dashboard pourra présenter :

```text
Remèdes
1 248

Publiés
934

En attente
276

Archivés
38

Ingrédients
542

Sources scientifiques
318

Commentaires
2 481

Vues
128 542
```

Ces statistiques servent uniquement à suivre l'activité de la plateforme.

---

# 27. WORKFLOW DE VALIDATION

Toutes les données importantes devront passer par une validation.

```text
DONNÉE AJOUTÉE
       ↓
    EN ATTENTE
       ↓
    EXAMEN
       ↓
 ┌─────┴─────┐
 ↓           ↓
VALIDÉE    REJETÉE
 ↓
PUBLIÉE
```

Les médias, commentaires et sources pourront également utiliser ce mécanisme.

---

# 28. TRAÇABILITÉ

Le système devra conserver l'historique des principales actions :

```text
Admin Jude
→ modification du remède #152

Admin X
→ publication du remède #152

Admin Y
→ modification de la source

Admin Jude
→ archivage d'un commentaire
```

---

# 29. SÉCURITÉ

La plateforme devra notamment prévoir :

- authentification sécurisée ;
- mots de passe hachés ;
- JWT ou mécanisme équivalent ;
- contrôle des rôles ;
- protection des routes administratives ;
- validation des entrées ;
- limitation des requêtes abusives ;
- protection contre le spam ;
- protection contre les injections ;
- gestion sécurisée des fichiers ;
- contrôle des types de fichiers ;
- limitation de la taille des fichiers ;
- sauvegardes régulières ;
- variables d'environnement pour les secrets.

---

# 30. PROTECTION DES DONNÉES DES UTILISATEURS

Le système de commentaires devra collecter le minimum d'informations nécessaire.

Pour un utilisateur public, le pseudonyme devra être privilégié.

Il faudra éviter d'exposer publiquement :

- adresse email ;
- mot de passe ;
- adresse IP ;
- informations personnelles inutiles.

---

# 31. ARCHITECTURE TECHNIQUE

## Frontend

```text
React
Vite
React Router
```

## Backend

```text
Node.js
Express
REST API
JWT
```

## Base de données

Pour la version initiale :

```text
SQLite
```

Une migration future vers PostgreSQL pourra être envisagée si le volume de données augmente.

---

# 32. ARCHITECTURE DES DONNÉES

Schéma conceptuel :

```text
                 ┌──────────────┐
                 │   REMEDES    │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
    INGREDIENTS     INDICATIONS     SOURCES
          │             │             │
          ↓             ↓             ↓
       MÉDIAS       DOCUMENTS      ARTICLES
          │
          ↓
     COMMENTAIRES
          │
          ↓
        LIKES
```

---

# 33. API

Exemples de routes publiques :

```text
GET /api/remedes
GET /api/remedes/:id
GET /api/remedes/search
GET /api/ingredients
GET /api/ingredients/:id
GET /api/indications
GET /api/indications/:id
GET /api/remedes/:id/media
GET /api/remedes/:id/sources
GET /api/remedes/:id/comments
```

Routes utilisateur :

```text
POST /api/comments
POST /api/comments/:id/report
POST /api/remedes/:id/like
```

Routes administration :

```text
POST   /api/admin/remedes
PUT    /api/admin/remedes/:id
DELETE /api/admin/remedes/:id
PATCH  /api/admin/remedes/:id/status

POST   /api/admin/ingredients
PUT    /api/admin/ingredients/:id

POST   /api/admin/sources
POST   /api/admin/media

GET    /api/admin/comments
PATCH  /api/admin/comments/:id/status

GET    /api/admin/reports
PATCH  /api/admin/reports/:id

GET    /api/admin/statistics
```

---

# 34. PERFORMANCE

La plateforme devra être conçue pour supporter progressivement l'augmentation du nombre :

- de remèdes ;
- d'utilisateurs ;
- de commentaires ;
- de photos ;
- de sources ;
- de consultations.

La pagination devra être utilisée pour les grandes listes.

Les images devront être optimisées.

Les fichiers lourds devront idéalement être stockés dans un système adapté plutôt que directement dans SQLite.

---

# 35. RESPONSIVE DESIGN

Le site devra fonctionner sur :

- ordinateur ;
- tablette ;
- smartphone.

L'expérience mobile devra être prise en compte dès la conception.

---

# 36. ACCESSIBILITÉ

L'interface devra autant que possible respecter les bonnes pratiques d'accessibilité :

- contraste suffisant ;
- textes lisibles ;
- navigation clavier ;
- textes alternatifs pour les images ;
- boutons clairement identifiables ;
- messages d'erreur compréhensibles.

---

# 37. SEO

La partie publique devra être optimisée pour les moteurs de recherche.

Chaque fiche pourra disposer de :

- titre ;
- description ;
- URL propre ;
- métadonnées ;
- données structurées lorsque pertinent.

Exemple :

```text
/remedes/nom-du-remede
```

---

# 38. PARTAGE

Les fiches publiques pourront être partagées via :

- lien direct ;
- WhatsApp ;
- Facebook ;
- autres plateformes sociales.

Le partage devra diriger vers la fiche documentaire et non présenter l'information comme une prescription.

---

# 39. VERSION MOBILE FUTURE

Une application mobile pourra être développée ultérieurement à partir de la même API.

```text
                 API
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    React      Mobile      Autre
     Web       Android     Client
```

---

# 40. FONCTIONNALITÉS SCIENTIFIQUES FUTURES

La base pourra éventuellement devenir une infrastructure de recherche.

Évolutions possibles :

- statistiques sur les plantes recensées ;
- fréquence des indications ;
- répartition géographique ;
- analyse des associations plantes-indications ;
- export CSV/Excel ;
- API scientifique ;
- visualisations ;
- cartographie ;
- analyses biostatistiques ;
- recherche bibliographique avancée.

---

# 41. INTELLIGENCE ARTIFICIELLE — ÉVOLUTION FUTURE

Une IA pourrait ultérieurement être utilisée pour :

- rechercher des informations dans les documents ;
- faciliter la classification ;
- détecter les doublons ;
- suggérer des rapprochements entre ingrédients ;
- aider à la recherche bibliographique ;
- extraire des informations structurées des documents.

L'IA ne devra toutefois pas être utilisée pour déclarer automatiquement qu'un remède est efficace ou sûr.

Toute conclusion scientifique devra rester soumise à une validation humaine appropriée.

---

# 42. GESTION DES DROITS D'AUTEUR

Chaque contenu externe devra disposer d'une information sur sa source.

Pour les photos, vidéos et documents :

- auteur lorsque connu ;
- source ;
- licence lorsque disponible ;
- URL originale ;
- conditions de réutilisation.

La plateforme ne devra pas copier ou redistribuer des contenus protégés sans autorisation.

---

# 43. CRITÈRES D'ACCEPTATION — VERSION ENRICHIE

La version 2 sera considérée comme fonctionnelle lorsqu'un visiteur peut :

- [ ] rechercher un remède ;
- [ ] rechercher un ingrédient ;
- [ ] voir tous les remèdes utilisant cet ingrédient ;
- [ ] rechercher une indication ;
- [ ] voir les remèdes associés à cette indication ;
- [ ] consulter une fiche détaillée ;
- [ ] voir les photos disponibles ;
- [ ] consulter les vidéos disponibles ;
- [ ] consulter les références scientifiques ;
- [ ] consulter les documents disponibles ;
- [ ] voir le niveau de fiabilité ;
- [ ] consulter les commentaires ;
- [ ] utiliser un pseudonyme pour commenter ;
- [ ] liker une fiche ;
- [ ] signaler un contenu.

L'administrateur doit pouvoir :

- [ ] gérer les remèdes ;
- [ ] gérer les ingrédients ;
- [ ] gérer les indications ;
- [ ] gérer les sources ;
- [ ] gérer les médias ;
- [ ] modérer les commentaires ;
- [ ] traiter les signalements ;
- [ ] publier ou archiver les données ;
- [ ] consulter les statistiques ;
- [ ] consulter les journaux d'activité.

---

# 44. PRINCIPES FONDAMENTAUX DU PROJET

Le projet repose sur les principes suivants :

### 1. Documentation

La plateforme documente les connaissances disponibles.

### 2. Transparence

Chaque information importante doit être associée à sa source lorsque celle-ci est connue.

### 3. Traçabilité

Les modifications doivent être enregistrées.

### 4. Prudence scientifique

Un témoignage ne doit jamais être présenté comme une preuve scientifique.

### 5. Sécurité

La plateforme ne doit pas encourager l'automédication ou l'utilisation dangereuse de substances.

### 6. Accessibilité

Les informations publiques doivent être facilement consultables.

### 7. Évolutivité

L'architecture doit permettre l'ajout futur de nouvelles fonctionnalités.

---

# 45. RÉSULTAT ATTENDU

À terme, **Remèdes du terroir** devra devenir une plateforme numérique permettant de répondre à des questions telles que :

> « Quels remèdes sont traditionnellement rapportés pour cette indication ? »

> « Dans quels remèdes retrouve-t-on cet ingrédient ? »

> « Quelles parties de cette plante sont rapportées comme utilisées ? »

> « Dans quelles régions cette pratique est-elle documentée ? »

> « Existe-t-il des publications scientifiques associées à cette plante ou à ce remède ? »

> « Quelle est la source de cette information ? »

> « Quel est le niveau de fiabilité de cette information ? »

L'objectif final est de construire **une base de données publique, structurée, documentée et évolutive**, pouvant servir à la fois à la conservation des connaissances, à la consultation publique, à l'enseignement et à la recherche.

---

# 46. ROADMAP

## Phase 1 — Fondations

- Base de données ;
- API ;
- authentification ;
- CRUD ;
- import Excel.

## Phase 2 — Interface

- accueil ;
- recherche ;
- fiches ;
- dashboard ;
- responsive design.

## Phase 3 — Recherche avancée

- recherche par ingrédient ;
- recherche par indication ;
- filtres ;
- pagination ;
- suggestions.

## Phase 4 — Documentation enrichie

- photos ;
- vidéos ;
- articles ;
- références scientifiques ;
- documents PDF.

## Phase 5 — Communauté

- pseudonymes ;
- commentaires ;
- likes ;
- signalements ;
- modération.

## Phase 6 — Administration avancée

- statistiques ;
- logs ;
- gestion des administrateurs ;
- gestion des médias ;
- validation avancée.

## Phase 7 — Mise en ligne

- serveur ;
- nom de domaine ;
- HTTPS ;
- sauvegardes ;
- monitoring ;
- sécurité ;
- déploiement.

## Phase 8 — Recherche scientifique

- export des données ;
- statistiques ;
- cartographie ;
- API publique ;
- outils d'analyse ;
- éventuellement intelligence artificielle.

---

# 47. POSITIONNEMENT DU PROJET

**Remèdes du terroir n'est pas une application de prescription médicale.**

C'est une **base de données publique de documentation des connaissances endogènes**.

La plateforme doit permettre de conserver et de rendre accessibles les informations tout en indiquant clairement :

**ce qui est rapporté, ce qui est documenté, ce qui est étudié et ce qui est scientifiquement validé.**

Cette distinction constitue l'un des principes fondamentaux du projet.