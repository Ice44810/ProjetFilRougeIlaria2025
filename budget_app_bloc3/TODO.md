# Plan de Développement du Backend Laravel

## Objectif
Créer un backend Laravel pour l'application Budget App avec les fonctionnalités:
- Affichage dynamique des transactions via API
- Gestion d'état avec des contrôleurs
- Routage pour les pages (dashboard, ajout transaction, graphiques)
- Interactivité AJAX sans rechargement de page
- Commentaires en français pour expliquer les logiques

## Étapes à suivre:

### 1. Configuration de la Base de Données
- [x] Configurer la connexion SQLite (plus simple pour le développement)
- [x] Créer les migrations pour les tables: users, transactions, categories
- [x] Créer les modèles Eloquent correspondants

### 2. Création des Modèles Eloquent
- [x] Modèle User avec relations
- [x] Modèle Transaction avec relations
- [x] Modèle Category avec relations

### 3. Création des Contrôleurs API
- [x] TransactionController (CRUD transactions)
- [x] AuthController (login, register, logout)
- [x] StatsController (statistiques, balance)

### 4. Configuration des Routes API
- [x] Routes pour /api/transactions
- [x] Routes pour /api/auth
- [x] Routes pour /api/stats
- [x] Routes pour /api/home

### 5. Implémentation des Services (optionnel, logique métier)
- [x] TransactionService pour les opérations complexes

### 6. Tests et Validation
- [x] Tester les endpoints API avec Postman ou curl
- [x] Vérifier que le frontend communique correctement

## Dépendances:
- Laravel 12
- SQLite (pour la simplicité)
- Composer pour les dépendances PHP

## Livrables Complémentaires (2025)
- [x] Code source complet et documenté
- [x] Guide utilisateur (GUIDE_UTILISATEUR.md)
- [x] Documentation technique (DOCUMENTATION_TECHNIQUE.md)

