# Cahier des Charges - Budget_App
## Application de Gestion de Budget Personnel

---

## 1. Introduction

### 1.1 Contexte du projet
Budget_App est une application web de gestion de budget personnel permettant aux utilisateurs de suivre leurs revenus et dépenses, de gérer leurs cartes de paiement, d'effectuer des transferts et de payer diverses factures (téléphone, internet, électricité, eau, etc.).

### 1.2 Objectifs du projet
- Permettre aux utilisateurs de suivre leurs finances personnelles
- Offrir une interface intuitive pour la gestion des transactions
- Faciliter les paiements de factures et les transferts d'argent
- Proposer un système de récompenses et de réductions

### 1.3 Portée du projet
Application web full-stack avec :
- Frontend en HTML/CSS/JavaScript (Bootstrap 5)
- Backend en Node.js
- Base de données MySQL
- Gestion des sessions utilisateur

---

## 2. Définition des utilisateurs

### 2.1 Types d'utilisateurs
| Rôle | Description | Permissions |
|------|-------------|-------------|
| Utilisateur (user) | Utilisateur standard de l'application | Gestion de son propre budget, transactions, cartes et contacts |
| Administrateur (admin) | Administrateur système | Accès complet à toutes les données (à implémenter) |

### 2.2 Profils utilisateurs cibles
- Particuliers souhaitant gérer leur budget personnel
- Utilisateurs novices en informatique (interface intuitive)
- Utilisateurs mobiles et desktop

---

## 3. Exigences fonctionnelles

### 3.1 Gestion de l'authentification

#### 3.1.1 Inscription
- **Description** : Permet à un nouvel utilisateur de créer un compte
- **Données requises** :
  - Email (unique, valide)
  - Mot de passe (haché avec bcrypt)
- **Comportement** :
  - Validation des champs obligatoires
  - Hachage du mot de passe avant stockage
  - Création automatique de l'utilisateur avec le rôle "user"
  - Redirection vers la page de connexion après inscription réussie

#### 3.1.2 Connexion
- **Description** : Permet à un utilisateur existant de se connecter
- **Données requises** :
  - Email
  - Mot de passe
- **Comportement** :
  - Vérification des identifiants
  - Création d'une session sécurisée (cookie httpOnly)
  - Stockage en mémoire côté serveur
  - Redirection vers le tableau de bord après connexion réussie

#### 3.1.3 Déconnexion
- **Description** : Permet à l'utilisateur de se déconnecter
- **Comportement** :
  - Destruction de la session serveur
  - Suppression du cookie client
  - Redirection vers la page de connexion

#### 3.1.4 Réinitialisation du mot de passe
- **Description** : Permet de récupérer un mot de passe oublié
- **Fonctionnalité** : Envoi d'un email de réinitialisation (simulation backend)

### 3.2 Tableau de bord (Dashboard)

#### 3.2.1 Affichage du solde
- **Description** : Affiche le solde actuel du utilisateur
- **Calcul** : Somme des revenus - Somme des dépenses
- **Format** : Montant avec devise (€)

#### 3.2.2 Récompenses
- **Description** : Affiche les points de fidélité/récompenses
- **Affichage** : Valeur statique (50 points par défaut)

#### 3.2.3 Dernières transactions
- **Description** : Liste des 5 dernières transactions
- **Informations affichées** :
  - Titre de la transaction
  - Montant (positif pour revenu, négatif pour dépense)

### 3.3 Gestion des transactions

#### 3.3.1 Création d'une transaction
- **Données requises** :
  - Titre (obligatoire)
  - Montant (obligatoire, positif)
  - Type : "income" (revenu) ou "expense" (dépense)
  - Catégorie (optionnelle)
- **Comportement** :
  - Insertion dans la base de données
  - Retour de l'ID de la transaction créée

#### 3.3.2 Liste des transactions
- **Filtres disponibles** :
  - Par catégorie
  - Par période (mois en cours, année en cours)
- **Tri** : Par date décroissante (plus récent en premier)
- **Informations affichées** :
  - ID, titre, montant, type, date de création
  - Nom de la catégorie (si applicable)

#### 3.3.3 Modification d'une transaction
- **Données modifiables** :
  - Titre, montant, type, catégorie
- **Validation** : Vérification des champs obligatoires

#### 3.3.4 Suppression d'une transaction
- **Comportement** : Suppression logique avec vérification de propriété

### 3.4 Gestion des catégories

#### 3.4.1 Liste des catégories
- **Description** : Affiche les catégories personnalisées de l'utilisateur
- **Propriété** : Chaque catégorie appartient à un utilisateur

#### 3.4.2 Création d'une catégorie
- **Données requises** : Nom de la catégorie

#### 3.4.3 Modification d'une catégorie
- **Données modifiables** : Nom de la catégorie

#### 3.4.4 Suppression d'une catégorie
- **Comportement** : Suppression avec vérification de propriété

### 3.5 Gestion des cartes

#### 3.5.1 Ajout d'une carte
- **Données requises** :
  - Numéro de carte (stockage sécurisé des 4 derniers chiffres uniquement)
  - Nom du titulaire
  - Date d'expiration
  - CVV (non stocké)
- **Calcul automatique** :
  - Détection de la marque (Visa, Mastercard, American Express)
- **Sécurité** :
  - Extraction des 4 derniers chiffres uniquement
  - Le numéro complet n'est jamais stocké

#### 3.5.2 Liste des cartes
- **Informations affichées** :
  - Titulaire de la carte
  - 4 derniers chiffres
  - Date d'expiration
  - Marque de la carte

#### 3.5.3 Suppression d'une carte
- **Comportement** : Suppression avec vérification de propriété utilisateur

### 3.6 Gestion des bénéficiaires

#### 3.6.1 Ajout d'un bénéficiaire
- **Données requises** :
  - Nom du bénéficiaire
  - Identifiant (numéro de téléphone ou compte bancaire)
  - Type : "phone" ou "bank"
- **Validation** : Le type doit être soit "phone" soit "bank"

#### 3.6.2 Liste des bénéficiaires
- **Catégorisation** :
  - Par téléphone
  - Par compte bancaire
- **Informations affichées** :
  - Nom, identifiant masqué (4 derniers chiffres), type

#### 3.6.3 Suppression d'un bénéficiaire
- **Comportement** : Suppression avec vérification de propriété

### 3.7 Gestion du profil utilisateur

#### 3.7.1 Consultation du profil
- **Informations affichées** :
  - Email
  - Nom complet
  - Téléphone
  - Adresse
  - Code postal
  - Ville
  - Rôle

#### 3.7.2 Modification du profil
- **Données modifiables** :
  - Email (obligatoire)
  - Nom complet
  - Téléphone
  - Adresse
  - Code postal
  - Ville

### 3.8 Services de paiement

#### 3.8.1 Pages de services disponibles
| Service | Page | Description |
|---------|------|-------------|
| Mobile | mobile.html | Recharge téléphonique |
| Internet | internet.html | Paiement facture internet |
| Électricité | electricity.html | Paiement facture électricité |
| Eau | waterbill.html | Paiement facture eau |
| Film/Divertissement | film.html | Abonnements streaming |
| Factures | bill.html | Gestion globale des factures |
| Marchandises | market.html | Achats en ligne |
| Réductions | rewards.html | Bons de réduction |

### 3.9 Transferts

#### 3.9.1 Transfert vers amis
- **Description** : Transfert via numéro de téléphone
- **Page** : mycontact.html, transfert.html

#### 3.9.2 Transfert vers banque
- **Description** : Transfert vers compte bancaire
- **Page** : transferbybank.html

#### 3.9.3 Rechargement de compte
- **Description** : Ajout de fonds au solde
- **Page** : topup.html

### 3.10 Fonctionnalités additionnelles

#### 3.10.1 Code QR
- **Page** : myqr.html
- **Description** : Génération et affichage du code QR personnel

#### 3.10.2 Notifications
- **Types** :
  - Toutes les notifications
  - Rappels
  - Transactions
  - Promotions
- **Gestion** : Permission utilisateur pour les notifications push

#### 3.10.3 Paramètres
- **Page** : setting.html, security_center.html
- **Options** :
  - Mode sombre/clair
  - Paramètres de notification
  - Centre de sécurité

#### 3.10.4 Support
- **Page** : help_support.html
- **Description** : Aide et support utilisateur

---

## 4. Exigences non fonctionnelles

### 4.1 Performance
- Temps de chargement des pages < 3 secondes
- Réponses API < 500ms
- Utilisation de sessions en mémoire pour un accès rapide

### 4.2 Sécurité
- **Authentification** : Hachage des mots de passe avec bcrypt (salt rounds: 10)
- **Sessions** : Cookies httpOnly pour prévenir les attaques XSS
- **Validation** : Vérification côté serveur de toutes les entrées utilisateur
- **SQL Injection** : Utilisation de requêtes préparées
- **Données sensibles** : Les numéros de carte complets ne sont jamais stockés
- **Protection des routes** : Toutes les pages sauf login/inscription nécessitent une session valide

### 4.3 Compatibilité
- **Navigateurs** : Chrome, Firefox, Safari, Edge
- **Responsive Design** : Interface adaptative (mobile-first)
- **Résolutions** : 320px à 1920px+

### 4.4 Maintenabilité
- Architecture MVC (Model-View-Controller)
- Séparation claire entre routes, contrôleurs et utilitaires
- Code documenté et commenté

### 4.5 Accessibilité
- Utilisation de balises sémantiques HTML
- Icônes Bootstrap Icons pour une meilleure compréhension
- Contraste de couleurs suffisant

---

## 5. Architecture technique

### 5.1 Structure des fichiers

```
Budget_App/
├── Backend/
│   ├── server.js              # Point d'entrée du serveur
│   ├── controllers/           # Logique métier
│   │   ├── cardsController.js
│   │   ├── categoriesController.js
│   │   ├── recipientsController.js
│   │   ├── transactionsController.js
│   │   └── usersController.js
│   ├── routes/                # Définition des routes API
│   │   ├── cards.js
│   │   ├── categories.js
│   │   ├── recipients.js
│   │   ├── transactions.js
│   │   ├── users.js
│   │   └── router.js
│   ├── utils/                 # Utilitaires
│   │   ├── db.js             # Configuration Base de données
│   │   └── sendJson.js
│   ├── pages/                # Pages HTML servies
│   └── public/               # Fichiers statiques
│       ├── assets/
│       │   ├── style.css
│       │   └── images/
│       └── js/
├── Frontend/
│   ├── Pages/                 # Pages HTML (copie)
│   └── Public/
│       ├── Assets/
│       └── Images/
└── Docs/
    └── notes_fonctionnelles.md
```

### 5.2 Base de données

#### Schéma de la base de données MySQL

**Table : users**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email de l'utilisateur |
| password | VARCHAR(255) | NOT NULL | Mot de passe haché |
| role | ENUM('admin','user') | DEFAULT 'user' | Rôle de l'utilisateur |
| fullName | VARCHAR(255) | NULL | Nom complet |
| phone | VARCHAR(20) | NULL | Numéro de téléphone |
| address | VARCHAR(255) | NULL | Adresse |
| postcode | VARCHAR(10) | NULL | Code postal |
| ville | VARCHAR(100) | NULL | Ville |

**Table : transactions**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| user_id | INT | NOT NULL, FOREIGN KEY | Référence utilisateur |
| title | VARCHAR(255) | NOT NULL | Titre de la transaction |
| amount | DECIMAL(10,2) | NOT NULL | Montant |
| type | ENUM('income','expense') | NOT NULL | Type de transaction |
| category_id | INT | NULL | Référence catégorie |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |

**Table : categories**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| name | VARCHAR(255) | NOT NULL | Nom de la catégorie |
| user_id | INT | NOT NULL | Propriétaire de la catégorie |

**Table : cards**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| user_id | INT | NOT NULL, FOREIGN KEY | Référence utilisateur |
| card_holder_name | VARCHAR(255) | NOT NULL | Nom du titulaire |
| last_4_digits | VARCHAR(4) | NOT NULL | 4 derniers chiffres |
| expiry_date | VARCHAR(7) | NOT NULL | Date d'expiration |
| card_brand | VARCHAR(50) | NOT NULL | Marque (Visa, MC, etc.) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date d'ajout |

**Table : recipients**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| user_id | INT | NOT NULL, FOREIGN KEY | Référence utilisateur |
| name | VARCHAR(255) | NOT NULL | Nom du bénéficiaire |
| identifier | VARCHAR(255) | NOT NULL | Téléphone ou IBAN |
| type | ENUM('phone','bank') | NOT NULL | Type de transfert |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date d'ajout |

### 5.3 Technologies utilisées

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Serveur | Node.js | - |
| Framework Web | Vanilla HTTP | - |
| Base de données | MySQL | - |
| Driver MySQL | mysql2 | - |
| Authentification | bcrypt | 10 (salt rounds) |
| Gestion des cookies | cookie | - |
| Frontend | Bootstrap | 5.3.3 |
| Icônes | Bootstrap Icons | 1.11.3 |
| Graphiques | Chart.js | - |

### 5.4 API REST

#### Points d'accès disponibles

| Méthode | Route | Description | Authentifié |
|---------|-------|-------------|-------------|
| POST | /register | Inscription utilisateur | Non |
| POST | /login | Connexion utilisateur | Non |
| GET | /logout | Déconnexion | Oui |
| GET | /api/home | Données du tableau de bord | Oui |
| GET | /api/transactions | Liste des transactions | Oui |
| POST | /api/transactions | Créer une transaction | Oui |
| PUT | /api/transactions/:id | Modifier une transaction | Oui |
| DELETE | /api/transactions/:id | Supprimer une transaction | Oui |
| GET | /api/categories | Liste des catégories | Oui |
| POST | /api/categories | Créer une catégorie | Oui |
| PUT | /api/categories/:id | Modifier une catégorie | Oui |
| DELETE | /api/categories/:id | Supprimer une catégorie | Oui |
| GET | /api/cards | Liste des cartes | Oui |
| POST | /api/cards | Ajouter une carte | Oui |
| DELETE | /api/cards/:id | Supprimer une carte | Oui |
| GET | /api/recipients | Liste des bénéficiaires | Oui |
| POST | /api/recipients | Ajouter un bénéficiaire | Oui |
| GET | /api/recipients/:id | Détails d'un bénéficiaire | Oui |
| DELETE | /api/recipients/:id | Supprimer un bénéficiaire | Oui |
| GET | /api/users | Profil utilisateur | Oui |
| PUT | /api/users | Modifier le profil | Oui |
| GET | /api/stats | Statistiques financières | Oui |

---

## 6. Interface utilisateur

### 6.1 Pages principales

#### Pages d'authentification
- login.html - Connexion
- inscription.html - Inscription
- resetpassword.html - Réinitialisation mot de passe
- changepw.html - Changement de mot de passe
- createnewpwd.html - Création nouveau mot de passe

#### Pages principales
- index.html - Tableau de bord (Accueil)
- Profile.html - Profil utilisateur
- transactions.html - Historique des transactions
- bankhistory.html - Historique bancaire
- card.html - Gestion des cartes
- cardinfo.html - Détails d'une carte
- addnewcard.html - Ajouter une carte

#### Pages de transfert et paiement
- transfert.html - Transfert d'argent
- transferconfirm.html - Confirmation de transfert
- transferbybank.html - Transfert par banque
- topup.html - Rechargement de compte
- paymentsource.html - Source de paiement

#### Pages de services
- bill.html - Gestion des factures
- mobile.html - Recharge mobile
- internet.html - Paiement internet
- electricity.html - Paiement électricité
- waterbill.html - Paiement eau
- film.html - Divertissement/Netflix
- market.html - Marchandises

#### Pages de gestion
- mycontact.html - Mes contacts
- addnewrecipient.html - Ajouter un bénéficiaire
- detailcontact.html - Détails contact
- myqr.html - Mon code QR

#### Pages récompense et promotions
- rewards.html - Récompenses et réductions
- giftcarddetail.html - Détails carte cadeau

#### Pages paramètres
- setting.html - Paramètres généraux
- security_center.html - Centre de sécurité
- notification_setting.html - Paramètres de notification
- edit_profil.html - Modifier le profil

#### Pages d'aide
- help_support.html - Aide et support
- ui-pages.html - Ensemble des pages

### 6.2 Design et ergonomie

#### Style visuel
- **Theme** : Moderne et épuré
- **Couleurs principales** :
  - Primaire : Violet/Bleu (#5e35b1, #4a3cc9)
  - Secondary : Gris clair
  - Success : Vert (#28a745)
  - Danger : Rouge (#dc3545)
  - Warning : Jaune (#ffc107)
- **Typographie** : Système Bootstrap par défaut
- **Icons** : Bootstrap Icons

#### Navigation
- **Mobile** : Header fixe avec menu hamburger (offcanvas)
- **Desktop** : Menu latéral (offcanvas)
- **Footer** : Navigation principale (Accueil, Historique, QR, Récompenses, Profil)

#### Composants Bootstrap utilisés
- Cards
- Modals
- Offcanvas
- Navs et Tabs
- Forms
- Buttons
- Badges
- List groups

---

## 7. Cas d'utilisation

### 7.1 UC1 : Inscription d'un nouvel utilisateur
1. L'utilisateur saisit son email et mot de passe
2. Le système vérifie que l'email n'est pas déjà utilisé
3. Le mot de passe est haché
4. Le compte est créé avec le rôle "user"
5. L'utilisateur est redirigé vers la page de connexion

### 7.2 UC2 : Connexion utilisateur
1. L'utilisateur saisit email et mot de passe
2. Le système vérifie les identifiants
3. Une session est créée
4. L'utilisateur est redirigé vers le tableau de bord

### 7.3 UC3 : Ajout d'une transaction
1. L'utilisateur remplit le formulaire (titre, montant, type, catégorie)
2. Le système valide les données
3. La transaction est enregistrée en base
4. Le tableau de bord est mis à jour

### 7.4 UC4 : Consultation de l'historique
1. L'utilisateur accède à la page transactions
2. Le système récupère les transactions de l'utilisateur
3. Les transactions sont affichées groupées par mois

### 7.5 UC5 : Ajout d'un bénéficiaire
1. L'utilisateur remplit le formulaire (nom, identifiant, type)
2. Le système valide le type (phone ou bank)
3. Le bénéficiaire est enregistré

### 7.6 UC6 : Paiement d'une facture
1. L'utilisateur sélectionne le type de facture
2. L'utilisateur saisit le montant
3. Le système traite le paiement (simulation)
4. Une transaction est créée

---

## 8. Diagramme des flux

### 8.1 Flux d'authentification
```
[Page Inscription] → [Vérification données] → [Création compte] → [Redirection Login]
[Page Login] → [Vérification identifiants] → [Création session] → [Tableau de bord]
```

### 8.2 Flux de transaction
```
[Formulaire Transaction] → [Validation] → [Insertion BDD] → [Mise à jour tableau de bord]
```

---

## 9. Contraintes et limitations

### 9.1 Limitations actuelles
- Stockage des sessions en mémoire (non persistent)
- Pas d'envoi réel d'emails (simulation)
- Pas de，真正的 paiement gateway
- Pas de notifications push réelles
- Récompenses statiques (non dynamiques)

### 9.2 Améliorations futures suggérées
- Implémentation d'une base de données Redis pour les sessions
- Intégration avec un vrai service d'email (SendGrid, Nodemailer)
- Intégration Stripe/PayPal pour les paiements
- Notifications push via Firebase
- Graphiques interactifs avec Chart.js
- Export PDF des transactions
- Application mobile native (React Native/Flutter)
- Multi-devises
- Budgets mensuels avec alertes
- Catégories prédéfinies

---

## 10. Glossaire

| Terme | Définition |
|-------|------------|
| Transaction | Opération financière (revenu ou dépense) |
| Catégorie | Classification d'une transaction |
| Bénéficiaire | Personne ou organisme destinataire d'un transfert |
| Session | Période de connexion utilisateur |
| bcrypt | Algorithme de hachage de mot de passe |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| MySQL | Système de gestion de base de données relationnelle |

---

## 11. Conclusion

Ce cahier des charges définit l'ensemble des fonctionnalités, exigences techniques et界面 de l'application Budget_App. Le projet est structuré de manière modulaire permettant une évolution et une maintenance facilitées. Les bases technologiques choisies (Node.js, MySQL, Bootstrap) garantissent une compatibility large et une prise en main rapide.

---

*Document généré le 25 Janvier 2025*
*Version 1.0*

