# Budget App - Application de Gestion de Budget Personnel

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel Version">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP Version">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</p>

## 📝 Description

**Budget App** est une application de gestion de budget personnel développée avec Laravel 12. Elle permet aux utilisateurs de suivre leurs revenus et dépenses, de catégoriser leurs transactions et de visualiser des statistiques financières détaillées.

Cette application fait partie du projet fil rouge Ilaria 2025 et constitue le backend API de l'application de gestion de budget.

## ✨ Fonctionnalités

### Gestion des Utilisateurs
- Inscription et authentification via API
- Gestion de profil utilisateur
- Changement de mot de passe
- Authentification par tokens (Laravel Sanctum)

### Transactions Financières
- Création, lecture, mise à jour et suppression de transactions
- Types de transactions : revenus (`income`) et dépenses (`expense`)
- Association à des catégories
- Filtrage par type, catégorie et période
- Tri par date

### Catégories
- Catégories globales (partagées par tous les utilisateurs)
- Catégories personnalisées par utilisateur
- Icônes associées (Bootstrap Icons)

### Statistiques et Graphiques
- Solde actuel (revenus - dépenses)
- Statistiques par catégorie
- Évolution mensuelle des revenus/dépenses
- Données pour graphiques camembert (pie chart)
- Données pour graphiques linéaires (line chart)

## 🛠️ Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Laravel** | ^12.0 | Framework PHP |
| **PHP** | ^8.2 | Langage serveur |
| **SQLite** | - | Base de données |
| **Laravel Sanctum** | ^4.3 | Authentification API |
| **Bootstrap Icons** | - | Icônes |

## 📁 Structure du Projet

```
budget_app_bloc3/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AuthController.php       # Gestion authentification
│   │       ├── TransactionController.php # CRUD transactions
│   │       ├── CategoryController.php    # Gestion catégories
│   │       └── StatsController.php      # Statistiques
│   └── Models/
│       ├── User.php                     # Modèle utilisateur
│       ├── Transaction.php              # Modèle transaction
│       └── Category.php                 # Modèle catégorie
├── database/
│   ├── migrations/                       # Migrations base de données
│   └── seeders/                         # Données initiales
├── routes/
│   ├── api.php                          # Routes API
│   ├── web.php                          # Routes web
│   └── console.php                      # Routes console
└── config/                              # Configuration Laravel
```

## 🚀 Installation

### Prérequis

- PHP 8.2 ou supérieur
- Composer
- Node.js et NPM (pour les assets)

### Étapes d'installation

1. **Cloner le projet**

```bash
cd budget_app_bloc3
```

2. **Installer les dépendances PHP**

```bash
composer install
```

3. **Copier le fichier d'environnement**

```bash
cp .env.example .env
```

4. **Générer la clé d'application**

```bash
php artisan key:generate
```

5. **Configurer la base de données SQLite**

```bash
touch database/database.sqlite
```

6. **Exécuter les migrations**

```bash
php artisan migrate
```

7. **(Optionnel) Peuplement de la base de données**

```bash
php artisan db:seed
```

8. **Démarrer le serveur de développement**

```bash
php artisan serve
```

L'application sera disponible à l'adresse : `http://localhost:8000`

## ⚙️ Configuration

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

### Authentification

L'application utilise Laravel Sanctum pour l'authentification par tokens. Les tokens sont envoyés dans l'en-tête :

```
Authorization: Bearer <votre_token>
```

## 📡 Points de Terminaison API

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription d'un nouvel utilisateur |
| POST | `/api/auth/login` | Connexion utilisateur |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Informations utilisateur |
| PUT | `/api/auth/profile` | Mise à jour du profil |
| PUT | `/api/auth/password` | Changement de mot de passe |

### Transactions

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/transactions` | Liste des transactions |
| GET | `/api/transactions/recent` | Transactions récentes |
| GET | `/api/transactions/balance` | Solde actuel |
| POST | `/api/transactions` | Créer une transaction |
| GET | `/api/transactions/{id}` | Voir une transaction |
| PUT | `/api/transactions/{id}` | Modifier une transaction |
| DELETE | `/api/transactions/{id}` | Supprimer une transaction |

### Catégories

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/categories` | Liste des catégories |
| GET | `/api/categories/type/{type}` | Catégories par type |
| POST | `/api/categories` | Créer une catégorie |
| GET | `/api/categories/{id}` | Voir une catégorie |
| PUT | `/api/categories/{id}` | Modifier une catégorie |
| DELETE | `/api/categories/{id}` | Supprimer une catégorie |

### Statistiques

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/stats` | Statistiques générales |
| GET | `/api/stats/categories` | Stats par catégorie |
| GET | `/api/stats/monthly` | Évolution mensuelle |
| GET | `/api/stats/pie` | Données graphique camembert |
| GET | `/api/stats/line` | Données graphique linéaire |
| GET | `/api/home` | Données page d'accueil |
| GET | `/api/balance` | Solde actuel |

### Paramètres de Requête

#### Filtres pour les transactions

| Paramètre | Valeurs | Description |
|-----------|---------|-------------|
| `type` | `income`, `expense` | Filtrer par type |
| `category_id` | integer | Filtrer par catégorie |
| `period` | `today`, `week`, `month`, `year` | Filtrer par période |
| `per_page` | integer | Nombre de résultats |

#### Paramètres pour les statistiques

| Paramètre | Valeurs | Description |
|-----------|---------|-------------|
| `type` | `income`, `expense` | Type de transaction |
| `period` | `month`, `year` | Période |
| `months` | integer | Nombre de mois |

## 💾 Structure de la Base de Données

### Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | ID unique |
| name | VARCHAR(255) | Nom de l'utilisateur |
| email | VARCHAR(255) | Email unique |
| password | VARCHAR(255) | Mot de passe hashé |
| role | VARCHAR(255) | Rôle (user, admin) |
| remember_token | VARCHAR(100) | Token remember me |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

### Table `categories`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | ID unique |
| name | VARCHAR(255) | Nom de la catégorie |
| type | ENUM | income ou expense |
| icon | VARCHAR(255) | Icône Bootstrap |
| user_id | INTEGER | ID utilisateur (nullable) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

### Table `transactions`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | ID unique |
| user_id | INTEGER | ID utilisateur |
| title | VARCHAR(255) | Titre |
| amount | DECIMAL(10,2) | Montant |
| type | ENUM | income ou expense |
| category_id | INTEGER | ID catégorie (nullable) |
| description | TEXT | Description |
| date | DATE | Date de la transaction |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## 📊 Exemples d'Utilisation

### Inscription

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Créer une transaction

```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Courses",
    "amount": 150.00,
    "type": "expense",
    "category_id": 7,
    "description": "Courses hebdomadaires",
    "date": "2025-01-15"
  }'
```

### Obtenir les statistiques

```bash
curl -X GET http://localhost:8000/api/stats \
  -H "Authorization: Bearer <votre_token>"
```

## 🔧 Commandes Utiles

```bash
# Effacer le cache
php artisan config:clear
php artisan cache:clear

# Modes de développement
php artisan serve                    # Serveur simple
npm run dev                          # Avec Vite (hot reload)

# Base de données
php artisan migrate                  # Migrations
php artisan migrate:fresh            # Recréer les tables
php artisan db:seed                  # Peuplement
php artisan migrate:fresh --seed     # Migration + seed

# Tests
php artisan test                     # Lancer les tests
```

## 📝 Notes

- Les mots de passe sont hashés avec `bcrypt` via `Hash::make()`
- Les tokens API ont une durée de vie illimitée (à configurer selon les besoins)
- Les catégories avec `user_id = NULL` sont globales (accessibles à tous)
- Les statistiques sont calculées en temps réel à partir des transactions

## 👤 Utilisateur de Test

Après l'exécution du seeder :

| Champ | Valeur |
|-------|--------|
| Email | test@example.com |
| Mot de passe | password123 |

## 📄 Licence

Ce projet est open-source sous licence MIT.

## 🙏 Remerciements

- [Laravel](https://laravel.com) - Le framework PHP
- [Laravel Sanctum](https://laravel.com/docs/sanctum) - Authentification API
- [Bootstrap Icons](https://icons.getbootstrap.com) - Icônes

