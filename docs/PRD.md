# PRD — Cortijo Cocina

**Statut :** proposition v1  
**Produit :** PWA familiale mobile-first  
**Contexte initial :** vacances au Cortijo, août 2026

## 1. Vision

Cortijo Cocina est le tableau de bord partagé des repas de vacances. Il permet à chaque membre de la famille de voir ce qui est prévu, de prendre sa part de responsabilité et de documenter les plats préparés afin de constituer, naturellement, le livre de recettes familial.

Le produit doit rendre l'organisation simple et légère : quelques gestes depuis un téléphone plutôt qu'une longue discussion de groupe, tout en conservant le plaisir et la mémoire des repas partagés.

## 2. Problème à résoudre

Pendant les vacances en famille, l'organisation des repas repose facilement sur quelques personnes : il faut décider quoi manger, savoir qui cuisine et éviter les oublis. Les recettes transmises oralement, les variantes et les photos des plats se perdent aussi d'une année à l'autre.

Cortijo Cocina répond à ces deux besoins liés :

- répartir visiblement la préparation des repas ;
- transformer les repas réellement cuisinés en patrimoine culinaire familial réutilisable.

## 3. Objectifs produit

### Objectifs

- Donner à toute la famille une vision commune du programme des repas.
- Permettre d'attribuer facilement un ou plusieurs préparateurs à chaque repas.
- Faciliter l'ajout progressif de recettes, photos et appréciations après un repas.
- Être agréable et utilisable principalement depuis un smartphone, y compris une fois installée comme application.
- Limiter la friction : pas de tableur, pas de format de recette imposé dès la première version.

### Indicateurs de succès

- Au moins 90 % des jours de vacances ont un repas renseigné avant la veille.
- Chaque membre actif est associé à au moins un plat ou repas sur la période.
- Au moins 60 % des plats cuisinés disposent d'une recette ou d'une note exploitable avant la fin du séjour.
- La PWA est installée sur la majorité des téléphones des participants volontaires.

### Hors périmètre initial

- planification nutritionnelle ou calcul de calories ;
- gestion détaillée des courses, des stocks et du budget ;
- réseau social public ou partage externe des recettes ;
- paiement, réservation ou logistique de voyage.

Ces sujets pourront être réévalués après validation de l'usage principal.

## 4. Utilisateurs et rôles

| Utilisateur | Besoin principal | Droits v1 proposés |
| --- | --- | --- |
| Membre de la famille | Consulter, se proposer, contribuer aux recettes | Lire et modifier les repas et plats partagés |
| Référent de séjour | Mettre le planning en route, résoudre les oublis | Mêmes droits, avec capacité future à gérer la période et les membres |

La première version peut rester volontairement simple : une famille et des membres préconfigurés. La gestion de comptes, familles multiples et permissions fines est une évolution, pas un prérequis au test du produit.

## 5. Parcours clés

### A. Organiser un repas

1. Un membre ouvre le calendrier.
2. Il choisit un jour et crée ou modifie le repas.
3. Il ajoute un ou plusieurs plats et désigne les cuisiniers responsables.
4. La famille voit immédiatement le programme et les responsabilités.

### B. Documenter un plat cuisiné

1. Après le repas, un membre ouvre le plat depuis le jour concerné ou la bibliothèque.
2. Il ajoute ou complète la recette, prend une photo et renseigne les appréciations.
3. Le plat apparaît dans la collection de recettes, retrouvable pour un prochain séjour.

### C. Retrouver une recette familiale

1. Un membre ouvre la bibliothèque des recettes.
2. Il parcourt ou trie les plats par récence, popularité ou ordre alphabétique.
3. Il consulte les photos, la recette, les cuisiniers et la note moyenne.

## 6. Fonctionnalités

### 6.1 Planification des repas — MVP

- Calendrier mensuel présentant un résumé par jour.
- Deux modes de lecture : semaine et paires de jours.
- Vue détaillée d'une journée dans une feuille mobile.
- Création, modification et suppression d'un repas à une date donnée.
- Ajout d'une note de contexte au repas (invités, restes, contraintes, etc.).
- Ajout d'un ou plusieurs plats par repas.
- Attribution d'un ou plusieurs cuisiniers pour chaque plat.

**Règle métier :** un enregistrement de repas correspond toujours au dîner. Il y a donc au plus un repas par date ; le déjeuner n'est pas géré par le produit.

### 6.2 Recettes et mémoire familiale — MVP enrichi

- Une recette peut être complétée après la création du repas.
- Une fiche affiche le nom du plat, les cuisiniers, la date, les photos, le texte de recette et la note moyenne.
- Ajout de plusieurs photos depuis l'appareil photo ou la galerie du téléphone.
- Ajout de notes de 0 à 20.
- Bibliothèque alimentée automatiquement par les plats des repas.
- Tri des fiches par date, note cumulée et nom.

### 6.3 Expérience PWA — MVP

- Application installable depuis un navigateur mobile.
- Lancement en mode application, avec icônes dédiées et orientation portrait.
- Design mobile-first, lisible dans une cuisine et rapidement manipulable à une main.
- États explicites de chargement, d'erreur et de liste vide.

### 6.4 Évolutions prioritaires après le MVP

1. **Authentification légère** : reconnaître le contributeur et limiter les modifications accidentelles.
2. **Vote nominatif** : une note par membre, modifiable, avec moyenne fiable.
3. **Recherche et filtres** : ingrédient, cuisinier, note, type de plat, sans photos, à refaire.
4. **Fiche recette structurée** : ingrédients, quantités, étapes, temps, portions, conseils et origine familiale.
5. **Suggestions de réemploi** : proposer les recettes les mieux notées ou jamais refaites.
6. **Mode hors ligne et synchronisation** : consultation hors connexion et mise en attente des contributions.
7. **Export du carnet familial** : PDF ou partage privé des recettes validées.

## 7. Exigences fonctionnelles détaillées

| Domaine | Exigence | Priorité |
| --- | --- | --- |
| Calendrier | Afficher tous les jours de la période et l'état de leur repas | Must |
| Responsabilité | Associer au moins un cuisinier à chaque plat planifié | Must |
| Repas | Créer, mettre à jour et supprimer un repas et ses plats | Must |
| Recettes | Enregistrer un texte de recette facultatif par plat | Must |
| Photos | Ajouter et retirer des photos de plat sur mobile | Must |
| Évaluation | Conserver des notes de 0 à 20 et calculer une moyenne | Should |
| Bibliothèque | Consolider les plats en cartes de recettes consultables | Must |
| PWA | Installer l'application et la lancer en mode autonome | Must |
| Recherche | Rechercher et filtrer la bibliothèque | Could |

## 8. Données produit

La base actuelle contient les objets suivants :

- **Membre de la famille** : identifiant et libellé, aujourd'hui préconfigurés.
- **Repas** : identifiant, date, note, liste de plats, dates de création et mise à jour.
- **Plat** : nom, cuisiniers, texte de recette optionnel, photos et notes.

### Ajustements de modèle recommandés

- Créer une entité `Recipe` distincte d'une occurrence de plat afin qu'une recette soit réutilisable plusieurs années sans dupliquer son contenu.
- Remplacer la liste anonyme de notes par des votes liés à un membre et à une recette/occurrence.
- Stocker les fichiers photo dans un stockage adapté et ne conserver en base que leurs métadonnées et URL ; éviter les données image encodées dans les enregistrements métier.
- Prévoir une notion de `Vacation` / séjour afin de ne pas figer le produit à août 2026.

## 9. Exigences non fonctionnelles

- **Mobile-first :** parcours complet sur un écran étroit, tactile et lisible en extérieur.
- **Rapidité :** affichage du calendrier et ouverture d'un jour perçus comme instantanés sur réseau mobile courant.
- **Fiabilité collaborative :** les modifications sont persistées et les échecs expliqués clairement.
- **Confidentialité :** contenu réservé à la famille ; photos et recettes ne sont pas publiques par défaut.
- **Accessibilité :** contrôles libellés, contraste suffisant, navigation clavier et messages d'erreur annoncés.
- **Compatibilité :** navigateurs mobiles modernes iOS et Android, avec installation PWA.

## 10. Périmètre de livraison recommandé

### Release 1 — Organiser le séjour

Conserver et stabiliser le socle existant : calendrier des dîners, fiches jour, plats, préparateurs, persistance et PWA installable.

### Release 2 — Construire le carnet familial

Faire évoluer la bibliothèque vers de vraies fiches recettes réutilisables, avec recherche, structuration minimale et votes nominatifs.

### Release 3 — Faire vivre la tradition

Ajouter les suggestions, l'export du carnet et un fonctionnement dégradé hors ligne. Ouvrir ensuite la gestion des séjours et des familles multiples si le besoin est confirmé.

## 11. Questions de décision à trancher

1. Tous les membres peuvent-ils modifier ou supprimer le planning, ou faut-il un référent ?
2. Souhaite-t-on conserver les recettes comme des notes libres au départ, ou imposer une fiche ingrédients + étapes ?
3. Les photos doivent-elles rester accessibles seulement pendant le séjour, ou faire partie durablement du carnet ?
4. L'usage cible concerne-t-il uniquement cette famille ou plusieurs séjours/familles à terme ?

## 12. Critères d'acceptation du MVP

Le MVP est prêt à être utilisé pendant un séjour lorsque :

- un membre peut installer l'application, ouvrir le calendrier et identifier les responsables de chaque jour ;
- il peut renseigner un repas avec au moins un plat et un cuisinier depuis un téléphone ;
- un autre membre voit la modification après rechargement ;
- il peut compléter une recette, y joindre une photo et une note ;
- le plat est visible dans la bibliothèque de recettes ;
- les erreurs réseau ou de validation ne font pas perdre silencieusement les saisies.
