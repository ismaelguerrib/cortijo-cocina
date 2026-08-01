# Audit mobile-first & plan d'implémentation — Cortijo Cocina (PWA)

> Livrable d'analyse. **Aucune refonte n'est réalisée à ce stade** : ce document décrit l'existant, les problèmes, et un plan d'exécution progressif. Les modifications de code viendront ensuite, phase par phase.

> **Suivi d'implémentation** (branche `mobile-first-optimization`) : Phases 0→6 réalisées. Voir le [journal de validation multi-écrans (§8)](#8-journal-de-validation-multi-écrans-phase-6) pour les résultats de la matrice de tests.

## 0. Stack & architecture identifiées

| Élément | Constat |
|---|---|
| Framework | Angular 20 (standalone components, signals, `@if`/`@for`, `ChangeDetectionStrategy.OnPush`) |
| UI kit | Angular Material 20 + CDK (dialog, bottom-sheet, form-field, select, spinner) |
| Styles | SCSS global (`src/styles/*`) + SCSS par composant (`styleUrl`), pas de Tailwind, pas de CSS Modules |
| Design tokens | Variables CSS `--app-*` définies dans `src/styles/_sizes.scss`, `_typography.scss`, `_effects.scss`, `_colors.scss` |
| Thème | **Thème couleur aléatoire à chaque chargement** via `ColorSystemService` (13 palettes très saturées) |
| Breakpoints | Deux seulement : `$bp-md: 48rem` (768px), `$bp-lg: 64rem` (1024px) dans `_sizes.scss` |
| PWA | `@angular/service-worker` + `ngsw-config.json` + `public/manifest.webmanifest`, `display: standalone`, `orientation: portrait` |
| Pages (routes) | `/calendrier` (défaut) et `/recettes` — `src/app/app.routes.ts` |
| Modales | Dialog plein écran (meal-editor) + bottom-sheet (day-detail) |
| Composants partagés | **`src/app/shared/ui/` est vide** → pas de bibliothèque de composants réutilisables (boutons/champs/modales). Tout passe par des classes globales (`.app-link-button`) et Material. |
| Tests | 4 specs Jest (`app`, `color-theme.helper`, `calendar-page`, `meal-editor-modal`). Pas de tests visuels ni e2e. |

**Constat structurant majeur (à lire avant tout le reste) :** l'unité de base de **tout** le système de design est `--app-size-unit: 1dvh` (`_sizes.scss:5`). Espacements, tailles de police, ombres, rayons, largeurs de dialog en dérivent. C'est la cause racine de la majorité des problèmes mobiles ci-dessous (typographie non accessible, layout qui bouge au clavier, texte minuscule en paysage). Voir problème **G1**.

---

## 1. Analyse de l'existant

Sévérité : 🔴 critique · 🟠 haute · 🟡 moyenne · ⚪ basse.

### A. Structure globale & layout

#### G1 🔴 — Typographie et espacements indexés sur la hauteur de viewport (`dvh`)
- **Pages/parcours** : toutes.
- **Composant** : système de design global.
- **Fichiers** : `src/styles/_sizes.scss:5-52` (`--app-size-unit: 1dvh`, `--app-font-*`, `--app-space-*`), `src/styles/_base.scss:14` (`font-size: var(--app-font-body)`), + tous les `.scss` qui consomment `--app-font-*` / `--app-space-*`.
- **Comportement actuel** : `--app-font-body = 1.95dvh`, `--app-font-caption = 1.45dvh`, etc. La taille du texte dépend de la **hauteur** de l'écran, pas des réglages utilisateur.
- **Comportement attendu mobile** : les tailles de police doivent être en `rem` (respect du corps de police racine et des réglages d'accessibilité du navigateur/OS), stables quand le clavier s'ouvre, et lisibles en portrait comme en paysage.
- **Cause probable** : volonté d'un rendu « plein écran » homogène ; mais `dvh` est une mesure de viewport, pas une mesure typographique.
- **Preuve chiffrée** (caption `1.45dvh` / body `1.95dvh`) :

  | Appareil (portrait) | 1dvh | caption | body |
  |---|---|---|---|
  | 320×568 (SE 1) | 5.68px | **8.2px** | 11.1px |
  | 360×640 | 6.40px | **9.3px** | 12.5px |
  | 375×667 (SE 2/3) | 6.67px | **9.7px** | 13.0px |
  | 390×844 (iPhone 14) | 8.44px | 12.2px | 16.5px |
  | 414×896 | 8.96px | 13.0px | 17.5px |

  → En **paysage** (hauteur ~375–430px), le body tombe à ~8px et le caption à ~5.5px : illisible.
- **Sévérité** : 🔴. **Étendue** : 100% de l'UI. **Risque utilisateur** : texte trop petit sur petits/anciens écrans, texte qui rétrécit/bouge quand le clavier apparaît (Android), **non-respect des préférences d'accessibilité** (échec WCAG 1.4.4 « Resize text » et 1.4.12), inutilisable en paysage.
- **Recommandation** : introduire une **échelle typographique en `rem`** (avec `clamp()` pour l'adaptation fluide bornée) et des **espacements en `rem`** ; réserver `dvh` aux seules mesures réellement liées à la hauteur de fenêtre (ex. `min-height` du shell). C'est le socle de tout le reste.

#### G2 🔴 — `viewport-fit=cover` absent → `safe-area-inset-*` inopérant
- **Fichiers** : `src/index.html:6` (`<meta name="viewport" content="width=device-width, initial-scale=1">`).
- **Comportement actuel** : `env(safe-area-inset-*)` est utilisé (`app.scss:36,93`, `calendar-page.scss:13`, `recipes-page.scss:8`, `meal-editor-modal.scss:38`) mais **renvoie toujours 0** sans `viewport-fit=cover`.
- **Attendu** : sur écrans à encoche / barre gestuelle en mode `standalone`, la nav basse et les footers fixes doivent se décaler des zones système.
- **Cause** : meta viewport incomplète.
- **Sévérité** : 🔴 (bloquant PWA installée). **Étendue** : nav basse + tous les footers collants + bas de page. **Risque** : boutons d'action et nav masqués par la barre d'accueil / l'indicateur gestuel.
- **Recommandation** : ajouter `viewport-fit=cover` puis auditer chaque `env(safe-area-inset-*)` (les valeurs existantes deviendront effectives).

#### G3 🟠 — Compensations de hauteur de nav codées « en dur »
- **Fichiers** : `app.scss:36` (`padding-bottom: calc(76px + env(...))`), `calendar-page.scss:13` et `recipes-page.scss:8` (`... + 72px + env(...)`).
- **Comportement actuel** : la hauteur réelle de la nav basse est `padding (dvh) + 48px min-height` → variable ; les pages compensent avec des constantes `72px`/`76px` non synchronisées.
- **Attendu** : l'espace réservé sous le contenu doit correspondre à la hauteur réelle de la nav quelle que soit la taille d'écran.
- **Cause** : valeurs magiques au lieu d'un token partagé (`--app-bottom-nav-height`).
- **Sévérité** : 🟠. **Risque** : contenu masqué derrière la nav, ou gros vide, selon l'appareil.
- **Recommandation** : définir un token unique `--app-bottom-nav-block-size` et l'utiliser à la fois pour la nav et le padding des pages.

#### G4 🟡 — Pas de garde-fou global anti-débordement horizontal ni de stratégie de coupure de mots
- **Fichiers** : `src/styles/_base.scss` (aucune règle `overflow-wrap` / `word-break` / `min-width:0` par défaut).
- **Comportement** : un titre de plat long, une note collée, un mot sans espace peuvent pousser la largeur ; les items flex/grid héritent de `min-width:auto` et peuvent refuser de rétrécir.
- **Attendu** : aucun débordement horizontal à 320px ; les longs contenus reviennent à la ligne.
- **Sévérité** : 🟡 (préventif). **Recommandation** : `overflow-wrap: anywhere` sur les conteneurs de texte, `min-width: 0` sur les items flex/grid concernés, et un test `html, body { overflow-x: clip }` **après** avoir corrigé les causes (pas pour masquer).

### B. Navigation

#### N1 🟠 — Calendrier : vue par défaut « grille 7 colonnes » inadaptée au téléphone
- **Page** : `/calendrier`. **Composant** : `CalendarGridComponent` (mode `grid`).
- **Fichiers** : `calendar-page.component.ts:46` (`layoutMode = signal('grid')`), `calendar-grid.component.scss:161-166` (`grid-template-columns: repeat(7, minmax(0,1fr))`), `calendar-grid.component.html:54-66`, `calendar-day-cell.component.*`.
- **Comportement actuel** : 7 colonnes → cellules de ~38–52px de large à 320–414px, contenant un grand numéro (`--app-font-title-sm`), « X plats » et des **chips de prénoms** (« Souleimane »). Les chips débordent/s'empilent, texte tassé, cibles tactiles minuscules ; `overflow-x: clip` masque le trop-plein.
- **Attendu** : sur téléphone, la vue par défaut doit être lisible et tapable d'une main.
- **Cause** : vue « mois complet » pensée desktop, activée par défaut partout.
- **Sévérité** : 🟠. **Étendue** : écran d'accueil de l'app. **Risque** : écran d'entrée illisible/inutilisable.
- **Recommandation** : par défaut, servir la vue **« 2 jours »** (`pairs`) en dessous de `$bp-md`, ou faire dégrader la grille en 1–2 colonnes empilées. La vue 7 colonnes reste pertinente ≥ tablette.

#### N2 🟡 — Nav basse : bon principe, cibles et libellés à sécuriser
- **Fichiers** : `app.scss:89-122`.
- **Comportement** : nav fixe en bas, 2 boutons, `min-height: 48px` (correct). Police en `--app-font-caption` (petite, cf. G1), `text-transform: uppercase` + `font-display` : risque de troncature de « Calendrier » sur très petit écran.
- **Sévérité** : 🟡. **Recommandation** : conserver le pattern, augmenter la lisibilité du libellé (taille rem), garantir le non-chevauchement à 320px.

### C. Formulaires — voir section 4 dédiée

#### F1 🟠 — Meal editor : densité et charge cognitive élevées
- **Fichiers** : `meal-editor-modal.component.html`, `.scss`, `.ts`.
- **Comportement** : un seul long flux : Date + Note + pour **chaque plat** (empilables) → Cuisinier·e·s (multi-select), Nom, Recette (textarea 6 lignes), Photos (grille), Votes (liste d'inputs number dynamiques). Plusieurs plats × plusieurs votes = page très longue et chargée.
- **Attendu** : hiérarchie claire, options avancées repliables, une action principale évidente.
- **Sévérité** : 🟠. Détaillé en **section 4**.

#### F2 🟠 — Types de clavier & attributs mobiles manquants
- **Fichiers** : `meal-editor-modal.component.html:118-124` (votes `type="number"` sans `inputmode`), `:13` (date OK), `:61` (titre), `:67` (recette).
- **Comportement** : les champs de vote n'annoncent pas `inputmode="numeric"`, aucun `enterkeyhint`, aucun `autocomplete`.
- **Attendu** : clavier numérique pour les votes, indices de touche entrée pertinents.
- **Sévérité** : 🟠. **Recommandation** : `inputmode="numeric"` + `pattern` sur les votes ; `enterkeyhint` adapté ; `autocomplete="off"` là où pertinent.

#### F3 🟡 — Footer d'action collant vs clavier virtuel
- **Fichiers** : `meal-editor-modal.component.scss:28-41,271-284` (`position: sticky; bottom:0` + `env(safe-area-inset-bottom)`).
- **Comportement** : le bouton « Enregistrer » collé en bas peut être recouvert par le clavier (iOS ne redimensionne pas la fenêtre ; le `sticky` se cale sur le conteneur, pas sur le viewport visuel). `env()` inopérant (cf. G2).
- **Attendu** : action principale toujours atteignable, non masquée par le clavier.
- **Sévérité** : 🟡. **Recommandation** : tester avec `VisualViewport`, prévoir un repli (footer non collant, ou padding réactif au clavier) ; corriger G2 d'abord.

#### F4 🟡 — Messages d'erreur qui déplacent le layout
- **Fichiers** : `meal-editor-modal.component.html:54-56,141-143` ; `mat-error` par défaut de Material.
- **Comportement** : l'apparition d'une `<mat-error>` / du bloc `.editor__error` pousse le contenu (saut de layout), d'autant que les hauteurs sont en `dvh`.
- **Attendu** : réservation d'espace ou insertion stable des erreurs.
- **Sévérité** : 🟡. **Recommandation** : réserver la zone de message (min-height) ou utiliser `subscriptSizing="dynamic"` de façon maîtrisée.

### D. Boutons & actions

#### B1 🟠 — Cibles tactiles trop petites / trop rapprochées
- **Fichiers** : `meal-editor-modal.component.scss:187-195` (vote remove ✕, `0.75rem`), `:251-261` (photo remove ✕, `0.65rem`, positionné à 4px), `:167-185` (input vote transparent, hauteur non garantie), `calendar-grid` chips.
- **Comportement** : plusieurs contrôles < 44×44px et proches les uns des autres.
- **Attendu** : cibles ≥ 44×44px, espacées (WCAG 2.5.8 / 2.5.5).
- **Sévérité** : 🟠. **Recommandation** : normaliser une taille de cible minimale via une classe/mixin partagée.

#### B2 🟡 — Groupes d'actions du footer
- **Fichiers** : `meal-editor-modal.component.scss:28-41` (déjà empilés en colonne — bon), `day-detail`/`recipes` (actions pleine largeur — bon).
- **Constat** : globalement correct ; garder l'empilement vertical + action primaire pleine largeur.

### E. Listes & tableaux

#### L1 🟠 — « Grille calendrier » = pseudo-tableau 7 colonnes (voir N1)
- Stratégie recommandée : sous mobile, passer d'un **tableau/grille dense** à un **empilement en cartes** (vue `pairs`) ; réserver la grille 7 colonnes à ≥ tablette. Alternatives comparées en section 3/annexe.

#### L2 🟡 — Galeries photos en `auto-fit minmax()`
- **Fichiers** : `day-detail-modal.component.scss:120-124`, `recipes-page.component.scss:82-93`, `meal-editor-modal.component.scss:234-238` (`repeat(3, 1fr)`).
- **Constat** : `auto-fit minmax(dvh, 1fr)` : correct dans le principe, mais le seuil est en `dvh` (cf. G1). En paysage, tuiles minuscules.
- **Sévérité** : 🟡. **Recommandation** : seuils en `rem`.

### F. Modales & overlays

#### M1 🟠 — Dialog meal-editor dimensionné via la hauteur de viewport
- **Fichiers** : `calendar-page.component.ts:95-101` (`width: 'min(100vw, var(--app-dialog-inline-max))'`, `--app-dialog-inline-max = 58 * 1dvh`, `height: 'var(--app-shell-min-block)' = 100dvh`).
- **Comportement** : largeur du dialog dérivée de la **hauteur** de l'écran (incohérent). En portrait mobile, `min(100vw, …)` → plein écran (OK par accident) ; en paysage court, largeur réduite arbitrairement.
- **Attendu** : dialog plein écran sur mobile, largeur bornée sur grand écran, indépendant de la hauteur.
- **Sévérité** : 🟠. **Recommandation** : `width: min(100vw, 32rem)` (ou token en rem), `max-width: 100vw`, hauteur gérée par le contenu + `100dvh` de plafond.

#### M2 🟡 — Bottom-sheet day-detail : pas d'affordance de fermeture ni de safe-area
- **Fichiers** : `day-detail-modal.component.html` (aucun bouton fermer), `.scss:3-7` (pas de `padding-bottom` safe-area, pas de `max-height`/handle).
- **Comportement** : fermeture uniquement par tap sur le scrim / drag ; contenu long (recettes 4000c + photos) → dépend du plafond Material (~80vh) et du scroll interne ; bas potentiellement sous la barre gestuelle (cf. G2).
- **Attendu** : poignée/bouton de fermeture visible, scroll interne clair, padding bas safe-area.
- **Sévérité** : 🟡. **Recommandation** : ajouter poignée + bouton fermer, `max-block-size` explicite, `padding-block-end: env(safe-area-inset-bottom)`.

### G. Contenus longs

#### C1 🟡 — Recette affichée sans préservation des retours à la ligne
- **Fichiers** : `day-detail-modal.component.html:25` (`<p class="dish-card__recipe">{{ dish.recipe }}</p>`), `.scss:109-112`.
- **Comportement** : la recette (multi-lignes dans la textarea) s'affiche en paragraphe **sans** `white-space: pre-wrap` → tout est aggloméré ; pas d'`overflow-wrap` → un mot/URL long peut déborder.
- **Attendu** : conserver les sauts de ligne, couper les mots longs.
- **Sévérité** : 🟡. **Recommandation** : `white-space: pre-wrap; overflow-wrap: anywhere;`.

### H. Images & médias

#### I1 ⚪ — Images de fond décoratives + animation infinie
- **Fichiers** : `app.html:1-18`, `app.scss:16-30,156-178` (`animation: family-drift linear infinite`), `background.constants.ts`.
- **Comportement** : images de famille en `position: fixed`, `max-width: 42vw`, animées en boucle **sans** `prefers-reduced-motion`.
- **Attendu** : respecter `prefers-reduced-motion: reduce`.
- **Sévérité** : ⚪ (accessibilité vestibulaire + batterie). **Recommandation** : couper l'animation sous `prefers-reduced-motion`.

### I. Clavier virtuel

#### K1 🔴 — Le clavier fait bouger typographie **et** espacements (conséquence de G1)
- **Comportement** : sur Android, l'ouverture du clavier réduit le viewport ; comme `dvh` en dépend, **tout le formulaire rétrécit/reflow** pendant la saisie. Sur iOS, `dvh` = viewport max (pas de shrink) mais le dialog `height: 100dvh` peut dépasser sous le clavier.
- **Attendu** : layout stable clavier ouvert.
- **Sévérité** : 🔴 (perçu comme un bug). **Dépend de G1**.

### J. Viewport & hauteurs dynamiques

#### V1 🟡 — `min-height` du shell/pages en `100dvh` répété
- **Fichiers** : `_sizes.scss:27` (`--app-shell-min-block: 100dvh`), utilisé dans `app.scss:35`, `calendar-page.scss:9`, `recipes-page.scss:4`, `meal-editor-modal.scss:6`.
- **Constat** : `dvh` est le bon choix pour une hauteur de fenêtre (mieux que `vh`). RAS sur le principe ; à conserver **uniquement** pour ces `min-height` et **retirer de la typographie/espacements** (G1).

### K. Accessibilité tactile — voir B1, et section 4

### L. Performance perçue

#### P1 ⚪ — Polices Google Fonts via `@import` distant
- **Fichiers** : `_typography.scss:1` (`@import url('https://fonts.googleapis.com/...')`).
- **Comportement** : import CSS distant **bloquant**, non mis en cache par `ngsw` (cross-origin) → en PWA hors-ligne, polices custom absentes (repli système) + FOIT possible.
- **Sévérité** : ⚪. **Recommandation** : self-host des polices (assets locaux) + `font-display: swap`, cachées par le service worker.

### M. Comportement PWA

#### PWA1 🟡 — Manifest correct mais `orientation: portrait` verrouillé
- **Fichiers** : `manifest.webmanifest`, `index.html`.
- **Constat** : `display: standalone`, icônes 192/512 + maskable, `theme_color` OK. `orientation: portrait` verrouille l'app installée → l'utilisation paysage reste possible en navigateur ; à assumer explicitement (voir G1 pour la lisibilité paysage en onglet).
- **Sévérité** : 🟡. **Recommandation** : décision produit à documenter ; tester quand même le paysage en navigateur.

### N. Thème & contraste (transverse)

#### T1 🟡 — Thème aléatoire très saturé → contraste variable
- **Fichiers** : `color-system.service.ts`, `_colors.scss` (13 thèmes), `color-theme.helper.ts`.
- **Comportement** : palette tirée au hasard à chaque chargement ; certaines combinaisons (ex. `page-muted` clair sur fond vif) passent sous les seuils de contraste WCAG.
- **Constat** : **choix esthétique assumé** (identité « punk/maximaliste » familiale). À ne **pas** supprimer, mais à sécuriser.
- **Sévérité** : 🟡. **Recommandation** : ajouter une contrainte de contraste minimal dans la génération/validation des thèmes, ou garantir un couple texte/fond conforme pour les éléments essentiels (labels, erreurs, actions).

---

## 2. Inventaire des composants à adapter

| Composant / fichier | Action | Pourquoi | Portée du gain |
|---|---|---|---|
| **`_sizes.scss` (tokens)** | ♻️ Refactor | Migrer type + espacements en `rem`/`clamp` ; garder `dvh` pour `min-height` shell | **Toute l'app** |
| **`index.html` (viewport)** | 🔧 Corriger | `viewport-fit=cover` | **Toute l'app** |
| **`_base.scss`** | 🔧 Corriger | `overflow-wrap`, `min-width:0`, garde anti-débordement, `prefers-reduced-motion` | **Toute l'app** |
| **`_typography.scss`** | ♻️ Refactor | Self-host polices, `font-display`, échelle rem | Toute l'app |
| **App shell / nav (`app.html`, `app.scss`)** | 🔧 Corriger | Token `--app-bottom-nav-block-size`, safe-area effective, lisibilité libellés | 2 pages |
| **`CalendarGridComponent`** | 📱 Responsive | Vue `pairs` par défaut < md ; grille 7 col ≥ tablette ; supprimer `width:100vw` | Écran d'accueil |
| **`CalendarDayCellComponent`** | 📱 Responsive | Empilement lisible, chips qui wrap proprement, cibles tactiles | Écran d'accueil |
| **`MealEditorModalComponent`** | ✂️ Simplifier + 🔧 | Sections/repli, `inputmode`, cibles ✕, footer vs clavier, erreurs stables | Parcours d'édition |
| **`DayDetailModalComponent`** | 🔧 Corriger | Bouton fermer, `max-height`, safe-area, `pre-wrap` recette | Parcours lecture |
| **`RecipesPageComponent`** | 📱 Responsive | Seuils galerie en rem, densité cartes | Page recettes |
| **Dialog config (`calendar-page.ts`)** | 🔧 Corriger | Largeur en rem, indépendante de la hauteur | Modales |
| **`_material.scss`** | 🔧 Corriger | Vérifier form-fields, overlays, options après migration tokens | Formulaires/overlays |
| **`shared/ui/` (vide)** | ➕ Factoriser | Créer classes/mixins partagés : `field`, `touch-target`, `action-bar`, `sheet` | Transverse |
| **`color-system.service.ts` / thèmes** | 🔧 (option) | Garantie de contraste minimal | Toute l'app |
| **Fond animé (`app.scss`)** | 🔧 Corriger | `prefers-reduced-motion` | Toute l'app |

**Composants partagés à corriger en priorité** (effet de levier maximal) : `_sizes.scss`, `index.html`, `_base.scss`, `_typography.scss`, app shell/nav. Corriger ces 5 points assainit immédiatement toutes les pages avant tout travail écran par écran.

---

## 3. Plan détaillé d'implémentation (par phases)

> Principe directeur : **d'abord les fondations transverses** (tokens, viewport, base) car elles conditionnent tout le reste, **ensuite** les écrans. Chaque phase est livrable et testable indépendamment, sans régression globale.

### Phase 0 — Corrections bloquantes (🔴)
- **Objectif** : rendre l'app lisible et sûre côté zones système, sans toucher aux fonctionnalités.
- **Fichiers** : `index.html` (viewport-fit=cover) ; `_sizes.scss` (préparer la bascule type/espacements en rem — voir Phase 1) ; `_base.scss` (anti-débordement + `prefers-reduced-motion`).
- **Modifs** : ajouter `viewport-fit=cover` ; ajouter garde `overflow-wrap`/`min-width:0` ; guard animation.
- **Ordre** : viewport → base.
- **Dépendances** : aucune.
- **Risques** : `viewport-fit=cover` révèle des zones jusque-là ignorées → vérifier que les `env()` existants ne créent pas de trous.
- **Tests** : rendu 320–414px, PWA installée avec encoche, pas de scroll horizontal.
- **Validation** : aucun débordement à 320px ; nav/footers hors zones système.

### Phase 1 — Fondations responsive globales (🔴, socle)
- **Objectif** : découpler typographie/espacements de `dvh`.
- **Fichiers** : `_sizes.scss`, `_typography.scss`, `_base.scss`, `_effects.scss` (ombres en rem si souhaité), `_material.scss` (revalidation).
- **Modifs** : nouvelle échelle `--app-font-*` en `rem`/`clamp()` (ex. `--app-font-body: clamp(0.95rem, 0.9rem + 0.4vw, 1.05rem)`), `--app-space-*` en `rem` ; **conserver** `--app-shell-min-block: 100dvh`.
- **Ordre** : après Phase 0.
- **Dépendances** : impacte tous les écrans → à faire tôt, avant les ajustements fins.
- **Risques** : réglages visuels à reprendre partout (les composants supposaient l'échelle dvh) ; c'est le chantier au plus fort effet de bord — prévoir une passe de revue visuelle page par page.
- **Tests** : snapshots visuels avant/après à 320/360/375/390/414 + tablette ; clavier ouvert (layout stable) ; police OS agrandie ; paysage.
- **Validation** : texte ≥ ~14px pour le corps sur tous les téléphones cibles ; plus de rétrécissement au clavier ; respect du zoom/police OS.

### Phase 2 — Navigation mobile (🟠)
- **Objectif** : nav basse fiable + vue calendrier adaptée.
- **Fichiers** : `app.scss`/`app.html` (token hauteur nav, safe-area), `calendar-page.component.ts` (défaut `pairs` < md), `calendar-grid.component.*`, `calendar-day-cell.component.*`.
- **Modifs** : `--app-bottom-nav-block-size` partagé ; vue `pairs` par défaut sur mobile ; supprimer `width: 100vw` (→ `100%`).
- **Dépendances** : Phase 1 (échelle rem).
- **Risques** : changement de vue par défaut = changement d'UX → **justifié** (la grille 7 col est inutilisable au doigt) ; ne pas supprimer la vue grille (reste dispo/≥ tablette).
- **Tests** : accueil à 320–414px, une main ; bascule des deux vues ; pas de contenu sous la nav.
- **Validation** : accueil lisible, chips non tronquées, cibles ≥ 44px.

### Phase 3 — Simplification des formulaires (🟠) — voir section 4
- **Objectif** : réduire la charge cognitive du meal-editor.
- **Fichiers** : `meal-editor-modal.component.*`, `_material.scss`, dialog config (`calendar-page.component.ts`).
- **Modifs** : sectionner par plat repliable, options avancées masquées, `inputmode`/`enterkeyhint`, cibles ✕, erreurs stables, largeur dialog en rem.
- **Dépendances** : Phases 1–2 ; **G2/viewport** pour le footer.
- **Risques** : ne pas modifier la logique métier (validations, payload) — uniquement présentation/UX.
- **Tests** : voir section 6 (clavier, erreurs, multi-plats).
- **Validation** : formulaire utilisable clavier ouvert, action principale visible, aucun saut de layout au message d'erreur.

### Phase 4 — Adaptation des contenus complexes (🟡)
- **Objectif** : listes/cartes/galeries/recette lisibles.
- **Fichiers** : `recipes-page.component.scss`, `day-detail-modal.component.*`, galeries.
- **Modifs** : seuils galerie en rem ; `white-space: pre-wrap`+`overflow-wrap` sur recettes ; densité cartes.
- **Dépendances** : Phase 1.
- **Tests** : textes courts/longs/vides, recette 4000c, 0 à N photos.
- **Validation** : pas de débordement, retours à la ligne conservés.

### Phase 5 — Modales & interactions tactiles (🟡)
- **Objectif** : dialog + bottom-sheet confortables au doigt.
- **Fichiers** : `day-detail-modal.*`, dialog config, `_material.scss`.
- **Modifs** : bouton fermer + poignée + `max-block-size` + safe-area bas ; largeur dialog en rem.
- **Dépendances** : Phases 0–1.
- **Tests** : ouverture/fermeture, contenu long, paysage, safe-area.
- **Validation** : modales entièrement utilisables sur petit écran.

### Phase 6 — Tests multi-écrans & non-régression (🟡)
- **Objectif** : figer les acquis.
- **Fichiers** : specs Jest existantes + éventuels snapshots.
- **Modifs** : ajouter tests de rendu clés / DOM ; check-list manuelle multi-largeurs.
- **Dépendances** : Phases 1–5.
- **Validation** : matrice de largeurs (section 6) verte.

### Phase 7 — Améliorations finales & stabilisation (⚪)
- **Objectif** : polissage.
- **Fichiers** : `_typography.scss` (self-host polices), `color-system.service.ts` (contraste), fond animé.
- **Modifs** : polices locales + cache SW ; garantie de contraste ; `prefers-reduced-motion`.
- **Validation** : offline OK, contraste minimal garanti, mouvement réduit respecté.

---

## 4. Stratégie spécifique pour les formulaires

Formulaires concernés : **meal-editor** (principal, complexe) et le **select « Trier »** de la page recettes (trivial). L'effort porte sur le meal-editor.

### Diagnostic de densité
Le formulaire empile, sans hiérarchie forte : `Date`, `Note`, puis **par plat** (répétable) : `Cuisinier·e·s` (multi-select), `Nom`, `Recette` (textarea 6 lignes, jusqu'à 4000 caractères), `Photos` (grille), `Votes` (liste d'inputs number). Avec 2–3 plats, l'écran devient très long et « chargé ».

### Recommandations par élément
- **Densité / nb de champs visibles** : réduire le nombre de champs simultanés en **repliant chaque plat** (accordéon) — un seul plat « ouvert » à la fois ; les autres en résumé (nom + nb votes).
- **Ordre des champs** : Nom du plat **avant** Cuisinier·e·s (on nomme puis on attribue) — à valider avec l'usage réel.
- **Champs facultatifs** : « Note », « Recette », « Photos », « Votes » sont optionnels → les **regrouper sous un repli « Détails / options »** pour un plat, afin de garder un premier écran minimal (Nom + Cuisinier·e·s).
- **Groupes de champs** : matérialiser les sections « Le plat », « Photos », « Votes » avec titres clairs (déjà partiellement présents).
- **Labels** : **conserver les labels** Material (ne pas les remplacer par des placeholders seuls — accessibilité). Le libellé « Cusinier.e.s » comporte une coquille (« Cusinier » → « Cuisinier ») répétée dans plusieurs fichiers.
- **Placeholders** : réserver aux exemples de format, jamais en remplacement du label.
- **Textes d'aide** : ajouter un hint discret pour Votes (« note sur 20 ») plutôt qu'un label criard.
- **Messages d'erreur** : espace réservé pour éviter les sauts (F4).
- **Boutons primaire/secondaire** : « Enregistrer » = primaire pleine largeur ; « Supprimer le repas » = secondaire nettement dé-emphasé (déjà le cas via `.editor__delete`). Remplacer `window.confirm` par une confirmation intégrée cohérente (optionnel).
- **Sélecteurs** : le multi-select cuisinier·e·s (9 personnes) est adapté ; garder le panel custom lisible.
- **Champs date** : `type="date"` natif — OK (bon clavier/roue natifs).
- **Champs numériques (votes)** : ajouter `inputmode="numeric"`, garantir hauteur ≥ 44px, ✕ tapable ≥ 44px.
- **Zones de texte (recette)** : 6 lignes par défaut, c'est beaucoup sur mobile → la mettre dans le repli « options » ; autoriser l'agrandissement.
- **Étapes longues / actions fixes en bas** : footer d'action à conserver **mais** géré vis-à-vis du clavier (F3) ; n'afficher l'action fixe que si elle ne masque pas le champ actif.
- **Autocomplétion / claviers** : `autocomplete` pertinent (souvent `off` ici, contenu libre) ; `enterkeyhint="done"` sur les derniers champs.
- **Attributs HTML** : `inputmode`, `enterkeyhint`, types adaptés systématisés.

### Décision par formulaire
- **Meal-editor** : **conservé sur une seule page**, mais **réorganisé en sections repliables par plat** et **options avancées masquées** par défaut. Ne pas le transformer en multi-étapes (le nombre de plats est variable ; un wizard rigide nuirait au flux). Si l'usage montre des saisies très longues, envisager plus tard un multi-étapes « 1 plat = 1 étape ».
- **Select « Trier » (recettes)** : **laissé tel quel** (déjà minimal), juste revalidé après migration des tokens.

---

## 5. Matrice de priorisation

| Chantier | Priorité | Impact utilisateur | Complexité | Risque technique | Dépendances | Gain attendu |
|---|---|---|---|---|---|---|
| G2 `viewport-fit=cover` | **Critique** | Élevé | Faible | Faible | — | Zones système respectées (PWA) |
| G1 tokens type/espacement → rem | **Critique** | Très élevé | Élevée | **Élevé** (effet de bord global) | — | Lisibilité + accessibilité + stabilité clavier |
| K1 layout stable au clavier | **Critique** | Élevé | Moyenne | Moyen | G1 | Formulaires utilisables |
| N1 vue calendrier par défaut mobile | Haute | Élevé | Moyenne | Moyen (UX) | G1 | Accueil utilisable |
| G3 hauteur nav tokenisée | Haute | Moyen | Faible | Faible | — | Plus de contenu masqué |
| F1/F2 simplification meal-editor | Haute | Élevé | Moyenne | Faible | G1, N1 | Charge cognitive réduite |
| B1 cibles tactiles | Haute | Moyen | Faible | Faible | — | Confort tactile / WCAG |
| G4 garde anti-débordement | Moyenne | Moyen | Faible | Faible | — | Robustesse contenus longs |
| M1/M2 modales | Moyenne | Moyen | Faible | Faible | G1, G2 | Modales confortables |
| C1 recette pre-wrap | Moyenne | Moyen | Faible | Faible | — | Lecture correcte |
| L2 galeries seuils rem | Moyenne | Faible | Faible | Faible | G1 | Cohérence paysage |
| P1 self-host polices | Basse | Faible | Moyenne | Faible | — | Offline + perf |
| T1 contraste thèmes | Basse | Moyen | Moyenne | Moyen | — | Accessibilité couleur |
| I1 reduced-motion | Basse | Faible | Faible | Faible | — | Confort/batterie |

---

## 6. Stratégie de tests

### Largeurs cibles (portrait)
320 · 360 · 375 · 390 · 414 px — **plus** tablettes 768 (`$bp-md`) et 1024 (`$bp-lg`) pour vérifier la continuité mobile-first. Tester aussi le **paysage** de 375–430px de hauteur.

### Types de tests
- **Manuels** (check-list par largeur) : pas de scroll horizontal ; aucun chevauchement ; cibles ≥ 44px ; nav/footers hors zones système ; texte non tronqué sans mécanisme.
- **Clavier virtuel** : ouvrir chaque champ du meal-editor ; vérifier layout stable, action « Enregistrer » atteignable, bon type de clavier (numérique pour votes, date natif).
- **Textes longs** : titre de plat très long, note collée sans espaces, recette 4000c avec sauts de ligne, prénoms multiples (chips) → pas de débordement, retours à la ligne conservés.
- **Zoom / police agrandie** : réglage OS « très grand » + zoom navigateur 200% → texte grossit réellement (valide la sortie de `dvh`).
- **Orientation** : portrait ↔ paysage sur calendrier et meal-editor.
- **PWA installée** : mode `standalone` sur appareil à encoche → safe-areas, offline (polices), thème.
- **États** : chargement (spinner), vide (recettes sans plat), erreur (feedback), données manquantes (jour sans repas).
- **Automatisés / non-régression** : étendre les specs Jest existantes (`calendar-page`, `meal-editor-modal`) pour couvrir le rendu des états et la présence des attributs (`inputmode`, labels). Vérifier `npm --prefix frontend test`.
- **Tests visuels** : non outillés aujourd'hui (pas de Storybook/Playwright). Option : introduire des snapshots DOM Jest a minima, ou Playwright screenshots multi-viewport en Phase 6 (à décider selon budget).

### Critères de sortie
Tous les résultats attendus des « Acceptance Criteria » verts : 0 scroll horizontal à 320px ; 0 chevauchement ; formulaires utilisables clavier ouvert ; actions visibles ; cibles confortables ; labels/alternatives présents ; erreurs sans saut de layout ; modales utilisables ; contenus longs adaptés ; nav utilisable d'une main ; cohérence inter-pages.

---

## 7. Résumé exécutif

### Les 5 problèmes les plus critiques
1. **G1 — Typographie & espacements en `dvh`** (`_sizes.scss:5`) : texte non accessible (ignore zoom/police OS), illisible en paysage et sur petits écrans, et qui **bouge quand le clavier s'ouvre**. Cause racine n°1.
2. **G2 — `viewport-fit=cover` absent** (`index.html:6`) : toutes les `safe-area-inset-*` sont inopérantes → nav/actions masquées par les zones système en PWA.
3. **K1 — Instabilité du layout au clavier** (conséquence de G1) : les formulaires rétrécissent/reflow pendant la saisie.
4. **N1 — Calendrier en grille 7 colonnes par défaut** : écran d'accueil illisible/inutilisable au doigt sur 320–414px.
5. **F1/B1 — Meal-editor dense + cibles tactiles trop petites** : charge cognitive élevée et contrôles < 44px trop rapprochés.

### Composants partagés à corriger en premier (effet de levier)
`_sizes.scss` (tokens), `index.html` (viewport), `_base.scss`, `_typography.scss`, **app shell/nav**. Les corriger assainit toutes les pages avant tout travail écran par écran.

### Gains rapides (faible coût, fort effet)
- `viewport-fit=cover` (une ligne).
- Token `--app-bottom-nav-block-size` remplaçant les `72/76px` magiques.
- `inputmode="numeric"` + agrandissement des ✕ dans le meal-editor.
- `white-space: pre-wrap` + `overflow-wrap` sur les recettes.
- `prefers-reduced-motion` sur le fond animé.
- Vue `pairs` par défaut sous `$bp-md`.

### Chantiers structurels
- **Migration des tokens type/espacement vers `rem`/`clamp`** (G1) — le plus fort en effet de bord, à faire tôt et à revoir visuellement page par page.
- **Factorisation `shared/ui/`** (aujourd'hui vide) : classes/mixins `field`, `touch-target`, `action-bar`, `sheet`.
- **Self-hosting des polices** + garantie de contraste des thèmes aléatoires.

### Ordre d'implémentation recommandé
**Phase 0** (viewport + garde base) → **Phase 1** (tokens rem — socle) → **Phase 2** (nav + calendrier) → **Phase 3** (meal-editor) → **Phase 4** (contenus/cartes) → **Phase 5** (modales) → **Phase 6** (tests multi-écrans) → **Phase 7** (polices, contraste, motion).

---

## Annexe — Hypothèses & points à valider
- **Cible produit** : app installée en **portrait** (manifest). Hypothèse : le paysage reste un cas navigateur secondaire mais doit rester lisible → à confirmer (impacte l'agressivité du `clamp`).
- **Thème aléatoire saturé** : supposé **volontaire** (identité). Hypothèse : on sécurise le contraste sans changer l'esthétique → à confirmer.
- **Ordre Nom/Cuisinier·e·s** dans le meal-editor : reco basée sur l'ergonomie, à valider par l'usage réel.
- **Tests visuels** : aucun outillage e2e/visuel présent ; introduire Playwright/snapshots est une décision de budget (Phase 6).
- **Coquille « Cusinier »** (→ « Cuisinier ») présente dans plusieurs fichiers : correction cosmétique, hors périmètre responsive mais à noter.
- Valeurs `dvh` chiffrées (section G1) calculées pour des hauteurs de viewport standard ; à confirmer sur appareils réels (barres navigateur variables).

---

## 8. Journal de validation multi-écrans (Phase 6)

Validation réalisée dans le navigateur intégré (mesure `documentElement.scrollWidth - innerWidth`, styles calculés, ouverture réelle des modales). Aucun correctif n'a été nécessaire : les Phases 0→5 tiennent sur toute la matrice.

### Matrice largeurs × routes — débordement horizontal

| Largeur (portrait) | Calendrier | Vue par défaut | Recettes | Débordement |
|---|---|---|---|---|
| 320 px | ✅ | pairs | ✅ | 0 |
| 360 px | ✅ | pairs | ✅ | 0 |
| 375 px | ✅ | pairs | ✅ | 0 |
| 390 px | ✅ | pairs | ✅ | 0 |
| 414 px | ✅ | pairs | ✅ | 0 |
| 768 px (`$bp-md`) | ✅ | grid + nav statique | ✅ | 0 |
| 1024 px | ✅ | grid | ✅ (2 colonnes) | 0 |

### Scénarios spécifiques

| Scénario | Attendu | Résultat |
|---|---|---|
| Paysage 812×375 | Texte lisible (plus de `dvh`) | `body` 16px, `caption` 12px, 0 débordement ✅ |
| Clavier virtuel (hauteur réduite ~380px) | Typo/espacements stables | `body` 16px, `caption` 12px inchangés ✅ |
| Police OS agrandie (root 22px ≈ 140 %) à 320px | Le texte grossit, pas de débordement | `overflow` 0, nav sans débordement, titres qui s'enroulent ✅ |
| Dialog meal-editor à 320px, 3 plats (accordéon) | Plein écran, pas de débordement | largeur 320, `overflow` 0 ✅ |
| Bottom-sheet day-detail | Plafonné + scroll interne + fermeture | `max-height` 85dvh, `overflow-y:auto`, « Fermer » ferme sans ouvrir l'éditeur ✅ |

### Reste à valider hors navigateur intégré (recommandé sur appareils réels)
- PWA **installée** (`standalone`) sur appareil à encoche : rendu effectif des `safe-area-inset-*` (nav basse, footers, bas du sheet).
- Clavier virtuel **réel** iOS/Android sur le meal-editor : comportement du footer collant « Enregistrer » (cf. F3, à traiter si un souci apparaît).
- Lecteur d'écran (VoiceOver/TalkBack) sur l'accordéon des plats et le bouton « Fermer » du sheet.

### Tests automatisés
Suite Jest : **15/15** verts (dont vue « 2 jours » par défaut + accordéon des plats). Pas d'outillage e2e/visuel introduit (décision de budget — un harnais Playwright multi-viewport reste l'option recommandée pour figer ces résultats).
