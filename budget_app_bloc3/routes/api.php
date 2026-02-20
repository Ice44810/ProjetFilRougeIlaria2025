<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StatsController;

/*
|--------------------------------------------------------------------------
| API Routes - Budget App
|--------------------------------------------------------------------------
|
| Ces routes définissent les points d'entrée de l'API pour l'application.
| L'authentification est gérée via Laravel Sanctum (tokens API).
|
| Format de la réponse JSON:
| {
|     "message": "...",
|     "data": {...}
| }
|
*/

/*
|--------------------------------------------------------------------------
| Routes Publiques (sans authentification)
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes Protégées (authentification requise)
|--------------------------------------------------------------------------
| Ces routes nécessitent un token d'authentification valide.
| Le token doit être envoyé dans l'en-tête Authorization: Bearer <token>
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // ==================== AUTH ====================
    // Routes pour la gestion de l'authentification
    
    /**
     * POST /api/auth/logout
     * Déconnexion de l'utilisateur
     * Supprime le token d'authentification actuel
     */
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    /**
     * GET /api/auth/me
     * Retourne les informations de l'utilisateur connecté
     */
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    /**
     * PUT /api/auth/profile
     * Mise à jour du profil utilisateur
     */
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    
    /**
     * PUT /api/auth/password
     * Changement du mot de passe
     */
    Route::put('/auth/password', [AuthController::class, 'changePassword']);


    // ==================== TRANSACTIONS ====================
    // Routes pour la gestion des transactions financières
    
    /**
     * GET /api/transactions
     * Liste toutes les transactions de l'utilisateur
     * 
     * Paramètres optionnels:
     * - type: income | expense (filtre par type)
     * - category_id: ID de la catégorie
     * - period: today | week | month | year (filtre par période)
     * - per_page: nombre de résultats par page
     */
    Route::get('/transactions', [TransactionController::class, 'index']);
    
    /**
     * GET /api/transactions/recent
     * Liste les transactions récentes (pour la page d'accueil)
     * 
     * Paramètres optionnels:
     * - limit: nombre de transactions (défaut: 5)
     */
    Route::get('/transactions/recent', [TransactionController::class, 'recent']);
    
    /**
     * POST /api/transactions
     * Crée une nouvelle transaction
     * 
     * Corps de la requête:
     * - title: string (requis) - titre de la transaction
     * - amount: numeric (requis) - montant
     * - type: income|expense (requis) - type de transaction
     * - category_id: integer (optionnel) - ID de la catégorie
     * - description: string (optionnel) - description
     * - date: date (optionnel) - date de la transaction
     */
    Route::post('/transactions', [TransactionController::class, 'store']);
    
    /**
     * GET /api/transactions/{id}
     * Affiche une transaction spécifique
     */
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    
    /**
     * PUT /api/transactions/{id}
     * Met à jour une transaction existante
     */
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    
    /**
     * DELETE /api/transactions/{id}
     * Supprime une transaction
     */
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    
    /**
     * GET /api/transactions/balance
     * Retourne le solde actuel (revenus - dépenses)
     */
    Route::get('/transactions/balance', [TransactionController::class, 'balance']);


    // ==================== CATEGORIES ====================
    // Routes pour la gestion des catégories
    
    /**
     * GET /api/categories
     * Liste toutes les catégories disponibles pour l'utilisateur
     * (catégories globales + catégories personnalisées)
     */
    Route::get('/categories', [CategoryController::class, 'index']);
    
    /**
     * GET /api/categories/type/{type}
     * Liste les catégories filtrées par type
     * 
     * Paramètre: type = income ou expense
     */
    Route::get('/categories/type/{type}', [CategoryController::class, 'indexByType']);
    
    /**
     * POST /api/categories
     * Crée une nouvelle catégorie personnalisée
     */
    Route::post('/categories', [CategoryController::class, 'store']);
    
    /**
     * GET /api/categories/{id}
     * Affiche une catégorie spécifique
     */
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    
    /**
     * PUT /api/categories/{id}
     * Met à jour une catégorie
     */
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    
    /**
     * DELETE /api/categories/{id}
     * Supprime une catégorie personnalisée
     */
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);


    // ==================== STATS ====================
    // Routes pour les statistiques et graphiques
    
    /**
     * GET /api/stats
     * Retourne les statistiques générales:
     * - balance: solde total
     * - total_income: total des revenus
     * - total_expense: total des dépenses
     * - transaction_count: nombre de transactions
     */
    Route::get('/stats', [StatsController::class, 'index']);
    
    /**
     * GET /api/stats/categories
     * Retourne les statistiques par catégorie
     * 
     * Paramètres:
     * - type: income | expense (défaut: expense)
     * - period: month | year (défaut: month)
     */
    Route::get('/stats/categories', [StatsController::class, 'categories']);
    
    /**
     * GET /api/stats/monthly
     * Retourne l'évolution mensuelle des revenus/dépenses
     * 
     * Paramètres:
     * - months: nombre de mois (défaut: 6)
     */
    Route::get('/stats/monthly', [StatsController::class, 'monthly']);
    
    /**
     * GET /api/stats/pie
     * Retourne les données pour le graphique camembert
     * 
     * Paramètres:
     * - type: income | expense (défaut: expense)
     * - period: month | year (défaut: month)
     */
    Route::get('/stats/pie', [StatsController::class, 'pie']);
    
    /**
     * GET /api/stats/line
     * Retourne les données pour le graphique linéaire
     * 
     * Paramètres:
     * - months: nombre de mois (défaut: 12)
     */
    Route::get('/stats/line', [StatsController::class, 'line']);


    // ==================== HOME ====================
    // Route spéciale pour la page d'accueil
    
    /**
     * GET /api/home
     * Retourne les données pour la page d'accueil:
     * - balance: solde actuel
     * - currency: devise
     * - rewards: points de fidélité
     * - lastTransactions: dernières transactions
     */
    Route::get('/home', [StatsController::class, 'home']);
    
    /**
     * GET /api/balance
     * Alias pour récupérer le solde (compatibilité avec le frontend)
     */
    Route::get('/balance', [StatsController::class, 'balance']);

});

