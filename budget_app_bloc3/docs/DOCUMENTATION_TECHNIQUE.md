# Documentation Technique - Budget App

## Table des Matières

1. [Présentation Générale](#présentation-générale)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Structure de la Base de Données](#structure-de-la-base-de-données)
5. [API Reference](#api-reference)
6. [Modèles et Relations](#modèles-et-relations)
7. [Authentification](#authentification)
8. [Points d'API Détaillés](#points-dapi-détaillés)
9. [Guide d'Installation](#guide-dinstallation)
10. [Configuration](#configuration)
11. [Sécurité](#sécurité)
12. [Améliorations Futures](#améliorations-futures)

---

## Présentation Générale

**Budget App** est une application de gestion de budget personnel développée avec **Laravel 12**. Elle constitue le backend API pour une application mobile ou web de suivi financier.

L'application permet :
- L'authentification des utilisateurs via tokens API
- La gestion complète des transactions (CRUD)
- L'organisation par catégories
- Le calcul de statistiques et la génération de données pour graphiques

---

## Architecture du Projet

L'application suit l'architecture **MVC (Model-View-Controller)** de Laravel, adaptée pour une API REST.

```
budget_app_bloc3/
├── app/
│   ├── Http/
│   │   └── Controllers/       # Contrôleurs API
│   │       ├── AuthController.php
│   │       ├── TransactionController.php
│   │       ├── CategoryController.php
│   │       └── StatsController.php
│   └── Models/                 # Modèles Eloquent
│       ├── User.php
│       ├── Transaction.php
│       └── Category.php
├── database/
│   ├── migrations/            # Schéma de la base de données
│   └── seeders/               # Données initiales
├── routes/
│   ├── api.php               # Routes API
│   ├── web.php               # Routes web
│   └── console.php           # Routes console
└── config/                    # Configuration Laravel
```

---

## Technologies Utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Laravel** | ^12.0 | Framework PHP principal |
| **PHP** | ^8.2 | Langage serveur |
| **SQLite** | - | Base de données (fichier) |
| **Laravel Sanctum** | ^4.3 | Authentification par tokens |
| **Bootstrap Icons** | - | Icônes pour les catégories |
| **Composer** | - | Gestionnaire de dépendances PHP |

### Choix Techniques

#### Pourquoi Laravel ?
- ✅ Framework robuste et sécurisé
- ✅ ORM Eloquent puissant pour les relations
- ✅ Sanctum pour l'authentification API
- ✅ Documentation complète en français

#### Pourquoi SQLite ?
- ✅ Simple à configurer (pas de serveur requis)
- ✅ Idéal pour le développement et les tests
- ✅ Facilement migrable vers MySQL/PostgreSQL en production

---

## Structure de la Base de Données

### Table `users`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | INTEGER | Non | Clé primaire auto-incrémentée |
| name | VARCHAR(255) | Non | Nom de l'utilisateur |
| email | VARCHAR(255) | Non | Email unique |
| password | VARCHAR(255) | Non | Mot de passe hashé (bcrypt) |
| role | VARCHAR(255) | Non | Rôle (user/admin), défaut: 'user' |
| remember_token | VARCHAR(100) | Oui | Token "se souvenir de moi" |
| created_at | TIMESTAMP | Non | Date de création |
| updated_at | TIMESTAMP | Non | Date de modification |

### Table `categories`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | INTEGER | Non | Clé primaire |
| name | VARCHAR(255) | Non | Nom de la catégorie |
| type | ENUM | Non | 'income' ou 'expense' |
| icon | VARCHAR(100) | Oui | Icône Bootstrap |
| user_id | INTEGER | Oui | ID utilisateur (NULL = global) |
| created_at | TIMESTAMP | Non | Date de création |
| updated_at | TIMESTAMP | Non | Date de modification |

**Note** : Les catégories avec `user_id = NULL` sont globales (partagées par tous les utilisateurs).

### Table `transactions`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | INTEGER | Non | Clé primaire |
| user_id | INTEGER | Non | ID utilisateur (FK) |
| title | VARCHAR(255) | Non | Titre de la transaction |
| amount | DECIMAL(10,2) | Non | Montant (2 décimales) |
| type | ENUM | Non | 'income' ou 'expense' |
| category_id | INTEGER | Oui | ID catégorie (FK) |
| description | TEXT | Oui | Description détaillée |
| date | DATE | Non | Date de la transaction |
| created_at | TIMESTAMP | Non | Date de création |
| updated_at | TIMESTAMP | Non | Date de modification |

### Index

Des index ont été ajoutés pour optimiser les requêtes :
- `transactions.user_id` - Pour récupérer les transactions d'un utilisateur
- `transactions.type` - Pour filtrer par type
- `transactions.date` - Pour les requêtes par période
- `transactions.user_id + transactions.date` - Combiné pour les requêtes avancées

---

## API Reference

### Base URL
```
http://localhost:8000/api
```

### En-têtes Requises
```
Content-Type: application/json
Authorization: Bearer <votre_token>
```

### Routes Publiques

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |

### Routes Protégées (authentification requise)

#### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/logout` | Déconnexion |
| GET | `/auth/me` | Profil utilisateur |
| PUT | `/auth/profile` | Modifier le profil |
| PUT | `/auth/password` | Changer le mot de passe |

#### Transactions
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/transactions` | Liste (avec filtres) |
| GET | `/transactions/recent` | Transactions récentes |
| POST | `/transactions` | Créer |
| GET | `/transactions/{id}` | Voir |
| PUT | `/transactions/{id}` | Modifier |
| DELETE | `/transactions/{id}` | Supprimer |
| GET | `/transactions/balance` | Solde actuel |

#### Catégories
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/categories` | Liste |
| GET | `/categories/type/{type}` | Par type |
| POST | `/categories` | Créer |
| GET | `/categories/{id}` | Voir |
| PUT | `/categories/{id}` | Modifier |
| DELETE | `/categories/{id}` | Supprimer |

#### Statistiques
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/stats` | Statistiques générales |
| GET | `/stats/categories` | Par catégorie |
| GET | `/stats/monthly` | Évolution mensuelle |
| GET | `/stats/pie` | Données camembert |
| GET | `/stats/line` | Données ligne |
| GET | `/home` | Données accueil |
| GET | `/balance` | Solde |

---

## Modèles et Relations

### Modèle User

```php
class User extends Authenticatable
{
    // Relations
    public function transactions()    // HasMany(Transaction::class)
    public function categories()     // HasMany(Category::class)
    
    // Méthodes
    public function isAdmin(): bool
    public function getBalance(): float
}
```

### Modèle Transaction

```php
class Transaction extends Model
{
    // Constantes
    const TYPE_INCOME = 'income';
    const TYPE_EXPENSE = 'expense';
    
    // Relations
    public function user()          // BelongsTo(User::class)
    public function category()       // BelongsTo(Category::class)
    
    // Méthodes
    public function isIncome(): bool
    public function isExpense(): bool
    public function getSignedAmount(): float
    public function getFormattedAmount(): string
    
    // Scopes
    public function scopeIncome($query)
    public function scopeExpense($query)
    public function scopePeriod($query, string $period)
}
```

### Modèle Category

```php
class Category extends Model
{
    // Constantes
    const TYPE_INCOME = 'income';
    const TYPE_EXPENSE = 'expense';
    
    // Relations
    public function user()          // BelongsTo(User::class)
    public function transactions()   // HasMany(Transaction::class)
    
    // Méthodes
    public function isGlobal(): bool
    public function getTotalForUser(int $userId): float
    
    // Scopes
    public function scopeIncome($query)
    public function scopeExpense($query)
    public function scopeGlobal($query)
    public function scopeForUser($query, int $userId)
}
```

### Schéma des Relations

```
User (1) ──────< (N) Transaction
User (1) ──────< (N) Category (personnelles)

Category (1) ──< (N) Transaction
```

---

## Authentification

L'application utilise **Laravel Sanctum** pour l'authentification par tokens.

### Flux d'authentification

1. **Inscription** : L'utilisateur s'inscrit → Reçoit un token
2. **Connexion** : L'utilisateur se connecte → Reçoit un token
3. **Requêtes** : Chaque requête sécurisée inclut le token

### Format du Token

```
Authorization: Bearer eyJpdiI6IjFlQkdmNGt0aE1...
```

### Durée de vie

Par défaut, les tokens Sanctum n'expirent pas. Pour la production, il est recommandé de :
- Configurer une durée d'expiration
- Implémenter le refresh token

---

## Points d'API Détaillés

### Authentification

#### POST /api/auth/register

**Requête :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Réponse (201) :**
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJpdiI6IjFlQkdm..."
}
```

#### POST /api/auth/login

**Requête :**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200) :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJpdiI6IjFlQkdm..."
}
```

### Transactions

#### GET /api/transactions

**Paramètres de requête :**
- `type` : 'income' | 'expense'
- `category_id` : integer
- `period` : 'today' | 'week' | 'month' | 'year'
- `per_page` : integer (défaut: 50)

**Réponse (200) :**
```json
{
  "transactions": [
    {
      "id": 1,
      "title": "Salaire",
      "amount": "3500.00",
      "type": "income",
      "category_id": 1,
      "description": "Salaire mensuel",
      "date": "2025-01-15",
      "created_at": "2025-01-15T10:00:00Z",
      "category": {
        "id": 1,
        "name": "Salaire",
        "icon": "bi-briefcase"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### Statistiques

#### GET /api/stats/pie

**Paramètres :**
- `type` : 'income' | 'expense' (défaut: 'expense')
- `period` : 'month' | 'year' (défaut: 'month')

**Réponse (200) :**
```json
{
  "type": "expense",
  "data": [
    {
      "id": 7,
      "name": "Alimentation",
      "value": "450.00"
    },
    {
      "id": 8,
      "name": "Transport",
      "value": "120.00"
    }
  ]
}
```

#### GET /api/stats/line

**Paramètres :**
- `months` : integer (défaut: 12)

**Réponse (200) :**
```json
{
  "data": [
    {
      "month": "2024-08",
      "month_name": "août",
      "income": 3500.00,
      "expense": 2100.00,
      "balance": 1400.00
    }
  ]
}
```

---

## Guide d'Installation

### Prérequis

- PHP 8.2 ou supérieur
- Composer
- Node.js et NPM (optionnel pour les assets)

### Étapes d'installation

```bash
# 1. Accéder au répertoire
cd budget_app_bloc3

# 2. Installer les dépendances
composer install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Générer la clé d'application
php artisan key:generate

# 5. Créer la base de données SQLite
touch database/database.sqlite

# 6. Exécuter les migrations
php artisan migrate

# 7. (Optionnel) Peuplement
php artisan db:seed

# 8. Démarrer le serveur
php artisan serve
```

### Utilisateur de test

Après le seed :
- **Email** : test@example.com
- **Mot de passe** : password123

---

## Configuration

### Variables d'environnement (.env)

```env
APP_NAME="Budget App"
APP_ENV=local
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/chemin/vers/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8000
```

### Configuration SQLite

1. Créer le fichier : `touch database/database.sqlite`
2. Modifier `.env` : `DB_CONNECTION=sqlite`
3. Commenter les autres options DB_*

---

## Sécurité

### Mesures implémentées

1. **Hashage des mots de passe** : Utilisation de `bcrypt` via `Hash::make()`
2. **Authentification par tokens** : Laravel Sanctum
3. **Protection CSRF** : Laravel (pour les routes web)
4. **Validation des données** : Utilisation de Laravel Validation
5. **Requêtes préparées** : Eloquent utilise PDO avec requêtes préparées

### Bonnes pratiques recommandées

- ✅ Utiliser HTTPS en production
- ✅ Configurer une expiration des tokens
- ✅ Implémenter la vérification email
- ✅ Ajouter une limite de tentatives de connexion
- ✅ Logger les actions sensibles

---

## Améliorations Futures

### Fonctionnalités à ajouter

1. **Notifications** : Alertes pour les dépenses excessives
2. **Budgets mensuels** : Limites de dépenses par catégorie
3. **Export** : Export PDF/CSV des transactions
4. **Multi-devices** : Synchronisation entre appareils
5. **Graphiques avancés** : Graphiques interactifs

### Optimisations

1. **Cache** : Mettre en cache les statistiques fréquentes
2. **Pagination** : Optimiser pour les grandes quantités de données
3. **Images** : Supporter les reçus en pièce jointe

### Infrastructure

1. **Base de données** : Migrer vers MySQL/PostgreSQL pour la production
2. **API Rate Limiting** : Limiter les requêtes API
3. **Documentation Swagger** : Générer une doc API interactive

---

## Glossaire

| Terme | Définition |
|-------|------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| Eloquent | ORM de Laravel |
| Migration | Script de création de tables |
| Seeder | Script de peuplement de données |
| Token | Jeton d'authentification |
| Sanctum | Package Laravel pour l'auth API |

---

## Licence

Ce projet est open-source sous licence MIT.

---

**Document généré pour le projet Budget App - Fil Rouge Ilaria 2025**

*Version : 1.0.0*  
*Date : Janvier 2025*

