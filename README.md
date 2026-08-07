# Dressing IA — V2 (web / PWA)

Prototype web installable de l'application « Dressing IA » : numériser son dressing, composer des tenues et redécouvrir ses vêtements oubliés. Version front-end autonome (HTML/CSS/JS), sans backend — toutes les données restent **sur l'appareil** (`localStorage`).

Cette V2 corrige les bugs de la V1 fournie et pose une vraie identité visuelle premium, conforme au brief : base blanc cassé / noir profond / gris doux, avec un **accent saisonnier dynamique** (bleu Tiffany l'été, orange chaud l'automne, ivoire doré l'hiver, bleu pastel le printemps).

## Arborescence

```
Dressing-IA-V2/
├── index.html      → structure des 3 écrans (Accueil, Dressing, Créer) + nav
├── style.css       → design system (tokens, typo, composants, carrousel)
├── script.js       → état, stockage, rendu, "IA" de composition de tenue
├── manifest.json   → PWA installable (icône, couleurs, nom)
├── sw.js           → service worker (cache de l'app shell, usage hors-ligne)
├── README.md       → ce fichier
└── assets/
    ├── logo.svg       → monogramme cintre, source vectorielle
    ├── icon-192.png   → icône PWA 192×192
    └── icon-512.png   → icône PWA 512×512
```

Aucune dépendance de build : ouvrir `index.html` dans un navigateur suffit. Pour l'installation PWA et le service worker, servir le dossier via un petit serveur local (le `file://` bloque les service workers) :

```bash
cd Dressing-IA-V2
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Ce qui a été corrigé depuis la V1

- **Fichiers reliés correctement** : `script.js` était fonctionnel mais reposait sur des ids/`className` (`.delete-zone`, `.select-circle`) déclarés en CSS et jamais utilisés en HTML — nettoyé.
- **Formulaire d'ajout incomplet** face au brief : matière, prix, note libre manquants → ajoutés derrière « + Ajouter une information », comme spécifié.
- **Modification impossible** : la V1 ne permettait ni d'éditer une fiche vêtement ni de la retrouver par recherche/filtre → ajout de `Modifier`, de la recherche et des filtres par catégorie.
- **Mode "Composer" absent** : la V1 ne générait une tenue qu'aléatoirement, sans étagère interactive ni "Compléter ma tenue" → ajout du carrousel vertical d'étagères horizontales avec pièce centrale mise en avant, et bouton dédié.
- **Aucune redécouverte, aucune saison** : ajoutés (rail "À redécouvrir" à 21 jours sans port, palette qui change selon le mois).
- **Pas de PWA** : ajout de `manifest.json`, `sw.js` et des icônes pour une installation sur iPhone (« Ajouter à l'écran d'accueil »).

## Écrans

**🏠 Accueil** — inspiration du jour, bouton « Voir la tenue » avec explication (« Pourquoi cette tenue ? »), rail « À redécouvrir », aperçu du mode couple (visuel, en attente de synchronisation réelle en V3).

**👕 Dressing** — recherche, filtres par catégorie, grille de pièces, mode suppression multiple, formulaire d'ajout/édition complet.

**✨ Créer** — deux modes :
- *Inspire-moi* : occasion + harmonie → tenue générée.
- *Je compose* : étagères verticales, une par catégorie, carrousel horizontal à défilement — la pièce au centre est sélectionnée. Bouton **Compléter ma tenue** pour laisser l'IA remplir le reste.

Le résultat s'affiche en cartes façon magazine, avec ❤️ **J'adore** (enregistre la tenue et « apprend » les goûts) et 🔄 **Modifier toute la tenue**.

## Logique « IA » (V2, sans backend)

Aucun vrai modèle n'est appelé : la V2 pose l'architecture et une heuristique locale crédible, à remplacer plus tard par un vrai service (Core ML / API) :

- Sélection aléatoire pondérée dans les catégories essentielles (Haut / Pantalon / Chaussure), en respectant les pièces déjà choisies sur l'étagère.
- Ajout opportuniste d'une veste ou d'un accessoire si le dressing en contient.
- Détection des pièces « oubliées » via `lastWear` (seuil `REDISCOVER_DAYS`, 21 jours par défaut, modifiable en haut de `script.js`).
- Les tenues likées sont stockées (`likedOutfits`) comme base pour un futur apprentissage des harmonies favorites.

## Roadmap technique (fidèle au document produit)

- **V1** ✅ couverte par cette base web (ajout, fiches, création manuelle, compléter ma tenue, historique, harmonies visuelles, suggestions simples).
- **V2** partiellement couverte ici (saison, redécouverte) — météo réelle et statistiques avancées restent à brancher sur une API.
- **V3** (Pinterest, avant achat, valise, couple avancé) — hors périmètre de ce prototype web ; le document produit recommande un passage natif SwiftUI/SwiftData + iCloud pour la synchronisation couple, conservé tel quel comme cible long terme.

## Confidentialité

Les photos et fiches vêtements sont stockées uniquement dans le `localStorage` du navigateur de l'utilisateur. Rien n'est envoyé à un serveur.
