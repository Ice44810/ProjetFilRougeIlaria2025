# Dossier de Présentation - Examen Développeur Web Fullstack
## Projet Fil Rouge Ilaria 2025 : Budget_App

### Introduction

**Présentation personnelle**  
Bonjour, je suis **Ilaria** [Nom de famille], en formation **Développeur Web Fullstack** (RNCP niveau 5). Dans le cadre de mon projet fil rouge, j'ai développé **Budget_App**, une application web complète de gestion de budget personnel.

**Contexte de l’examen/formation**  
Ce projet s'inscrit dans une progression par blocs :  
- **Bloc 1** : Frontend vanilla (HTML/CSS/JS responsive).  
- **Bloc 2** : Backend vanilla Node.js + MySQL (auth/CRUD).  
- **Bloc 3** : Refonte Symfony 7 (framework PHP/Doctrine).  
Sujet : Application permettant de suivre revenus/dépenses, gérer cartes/contacts, effectuer transferts/recharges, payer factures, avec tableaux de bord et responsive design.

### Besoin et cahier des charges

**Problématique** : Les particuliers ont besoin d'un outil simple pour tracker leurs finances, catégoriser transactions (revenus/dépenses), visualiser évolution (graphiques), gérer paiements sécurisés (cartes, transferts phone/bank), sans complexité bancaire.

**Objectifs et fonctionnalités principales** (tiré de `Cahier_des_charges.md`) :  
- **Auth** : Inscription/connexion/logout/profil (rôles user/admin).  
- **Dashboard** : Solde (revenus - dépenses), dernières txns, rewards.  
- **CRUD** : Transactions (titre/montant/type/catégorie), Catégories, Cartes (last4/expiry/brand), Recipients (name/id/type phone/bank).  
- **Opérations** : Top-up, transferts, paiements (mobile/internet/élec/eau/film/market).  
- **Autres** : QR code, notifications, settings, historique bancaire.  
Responsive mobile-first (Bootstrap 5). Sécurité : bcrypt, sessions, prepared queries.

### Conception

**Maquettes / wireframes** :  
Fichiers fournis dans `Fichiers Budget_app/Projet 4/` : Home.pdf, Login.pdf, Profile.pdf, Topup.pdf, Transfer.pdf, etc. + `Diagramme ProjetFilrouge.drawio` (ERD). Design moderne violet/bleu, icônes Bootstrap Icons, modals/offcanvas pour mobile.

**Architecture** :  
- **Frontend** : Vanilla HTML/Twig + Bootstrap 5 (20+ pages : index.html, transactions.html, profile.html...).  
- **Backend** :  
  | Version | Stack |  
  |---------|-------|  
  | Node.js | HTTP/MySQL2/Bcrypt/Cookies (MVC : controllers/routes/utils). |  
  | Symfony 7 | Doctrine ORM (entités User/Transaction/Category/Card/Recipient), Controllers (20+ : HomeController, TransactionController...), Security (roles/validation), Twig templates, API JSON. |  
- **Schéma DB** (MySQL) : 5 tables principales (voir entités), relations ManyToOne/OneToMany. Migrations Doctrine (`migrations/`).  
API REST : /api/transactions (GET/POST/PUT/DELETE), /api/home (stats), etc.

### Technologies et stack

**Front** : HTML5, CSS3 (Bootstrap 5.3), JavaScript vanilla, Bootstrap Icons, responsive media queries, ARIA/WCAG accessibilité.

**Back** :  
- **Node.js** : Express-like vanilla (server.js), MySQL2 (prepared queries), Bcrypt (salt 12), cookie-parser (httpOnly/sameSite).  
- **Symfony 7** : PHP 8.2+, Doctrine ORM/migrations, Twig, Security (UserInterface), Validation constraints, API Platform-like JSON groups.  
**DB** : MySQL (schemas SQL fournis).  
**Sécurité** : Hachage mots de passe, CSRF (Symfony), validation serveur, no full card storage (last4 only).  
**Tests** : PHPUnit (`Backend_bloc3/tests/`), Lighthouse (responsive/accessibilité).

### Démonstration de l’application

**Parcours utilisateur principal** (lancer `symfony server:start` dans Backend_bloc3) :  
1. **Inscription/Connexion** : `/register` → `/login` (email/password) → Dashboard.  
2. **CRUD Transactions** : Ajouter txn (titre €50 \"Salaire\", income), lister/filtrer par mois/catégorie, edit/delete → signed amounts (+/-).  
3. **Gestion** : Ajouter carte (****1234 Visa), recipient (\"Ami\" phone 06...), catégorie (\"Loisirs\").  
4. **Opérations** : Top-up (+€100), Transfert (to recipient), Bill payment (mobile).  
5. **Responsive** : Mobile hamburger menu, cards stackent. **CRUD ops** sécurisées (auth req). Cas clés : Balance update realtime-like, historique groupé.

**Commande démo** : `cd Backend_bloc3 && symfony server:start` (https://127.0.0.1:8000).

### Gestion de projet

**Organisation** : Agile itératif (3 blocs), Git (`git` dir, branches TODO_*.md). Outils : VSCode, Symfony CLI, phpMyAdmin, Trello-like TODO.md.  

**Répartition/Tâches** : Bloc1 (UI/wireframes), Bloc2 (Node.js CRUD/auth), Bloc3 (Symfony migration).  
**Difficultés/Solutions** :  
- Migration Node→Symfony : Utilisé Doctrine pour ORM vs raw MySQL2.  
- Sécurité sessions : Symfony Security vs in-memory Node.js.  
- Responsive 20+ pages : Bootstrap offcanvas modals.  
Temps : 3 mois fil rouge.

### Bilan et perspectives

**Ce qui fonctionne** : Auth complète, full CRUD entités, responsive multi-écrans, API JSON, validation/sécurité robuste, DB migrations. Tests PHPUnit OK, Lighthouse >90% (perf/accessibilité).

**Limites** : Payments simulés (no Stripe), sessions in-memory (no Redis), rewards statiques, no PWA/push notifs.

**Améliorations** : Intégrer Stripe/PayPal, Redis/JWT, React frontend, budgets mensuels/alertes, export PDF, déploiement Heroku/Vercel/Docker.

**Ce que j'ai appris** : Fullstack complet (vanilla→framework), POO/ORM (Doctrine), sécurité web, responsive design, migration legacy→moderne, Git workflow.

*Présentation prête : 30min + Q/R. Projet open-source : github.com/[repo]. Merci !*

