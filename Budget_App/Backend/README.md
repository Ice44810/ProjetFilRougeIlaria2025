# Budget App - Fil Rouge 2025

**Budget App** est une application web innovante de gestion de finances personnelles et de services bancaires. Elle permet à ses utilisateurs de suivre leurs dépenses, gérer leurs cartes bancaires, effectuer des transferts d'argent et payer leurs factures via une interface fluide et "Mobile-First".

Ce projet a été développé dans le cadre de mon projet **Fil Rouge** de formation.

---

## Fonctionnalités Principales

- ** Tableau de bord interactif** : Suivi du solde en temps réel et aperçu des transactions récentes.
- ** Gestion des cartes bancaires** : Ajout, consultation et suppression de cartes de crédit.
- ** Transferts et Bénéficiaires** : Enregistrement de contacts (IBAN ou Téléphone) et virements simplifiés.
- ** Statistiques détaillées** : Graphiques d'historique bancaire (7 derniers jours, 30 jours, personnalisable) et filtrage précis par mois ou statuts.
- ** Paiement de Factures** : Intégration simulée des opérateurs d'électricité, d'eau et d'internet.
- ** Récompenses et Bons d'achat** : Système de coupons promotionnels dynamiques avec partenaires.
- ** Sécurité** : Inscription, connexion, et modification de mot de passe sécurisées.

---

## Architecture et Technologies

Le projet adopte une architecture client-serveur classique, rendue légère et performante en utilisant l'écosystème Node.js natif.

### Front-End (Client)
- **HTML5 / CSS3** : Structure sémantique respectant les normes d'accessibilité (A11y/WCAG).
- **Bootstrap 5.3** : Framework CSS pour un design responsive, des modals, offcanvas et composants UI.
- **Vanilla JavaScript (ES6+)** : Logique front-end native, manipulation du DOM et appels `fetch()` (dans profil :const nameEl = document.getElementById('userName');)
- **Bootstrap Icons** : Typographie iconographique.

### Back-End (Serveur)
- **Node.js** : Environnement d'exécution côté serveur.
- **Architecture Vanilla** : Utilisation du module `http` natif pour gérer les requêtes et les routes (sans framework de type Express).
- **Bcrypt** : Hachage sécurisé des mots de passe.
- **Cookie & Sessions** : Gestion de l'authentification et maintien de la session utilisateur.

### Base de données
- **MySQL** : Base de données relationnelle.
- Les tables comprennent : `users`, `transactions`, `categories`, `cards` et `recipients`.
- Requêtes préparées pour la protection contre les injections SQL.

---

## Structure du Projet

```text
Budget_App/Backend/
├── handlers/         # Logique métier du back-end (API endpoints)
│   ├── auth.js       # Gestion de la connexion / inscription
│   ├── stats.js      # Calculs des balances et données de graphiques
│   └── ...
├── pages/            # Vues Front-End (Fichiers HTML)
│   ├── index.html    # Tableau de bord principal
│   ├── Profile.html  # Gestion du profil
│   ├── banque.html   # Gestion du compte
│   └── ...
├── public/           # Fichiers statiques servis au client
│   ├── assets/       # CSS (style.css) et Images
│   └── js/           # Scripts JS (api.js, bankhistory.js, ...)
├── utils/            # Utilitaires globaux
│   ├── db.js         # Configuration et instanciation MySQL
│   └── logger.js     # Suivi des logs serveur
├── package.json      # Dépendances Node.js
└── server.js         # Point d'entrée principal (Serveur HTTP)
```

---

## Installation & Exécution Locale

1. **Cloner le projet** sur votre machine.
2. **Configurer la base de données** : Assurez-vous qu'un serveur MySQL fonctionne en local (`root`:`Root@123`). Le script `utils/db.js` s'occupe de créer automatiquement la BDD `Backend_node` et ses tables.
3. **Installer les dépendances** :
   ```bash
   npm install
   ```
4. **Démarrer le serveur** :
   ```bash
   npm start
   ```
5. Ouvrez le navigateur sur : `http://localhost:3000`