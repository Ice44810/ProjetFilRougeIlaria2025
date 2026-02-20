<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Contrôleur TransactionController - Gestion des transactions financières
 * 
 * Gère les opérations CRUD sur les transactions:
 * - Liste de toutes les transactions (avec filtres)
 * - Création d'une nouvelle transaction
 * - Affichage d'une transaction spécifique
 * - Mise à jour d'une transaction
 * - Suppression d'une transaction
 * 
 * Fonctionnalités de filtrage:
 * - Par type (income/expense)
 * - Par catégorie
 * - Par période (today, week, month, year)
 */
class TransactionController extends Controller
{
    /**
     * Récupère toutes les transactions de l'utilisateur connecté
     * 
     * Possibilité de filtrer par:
     * - type: income ou expense
     * - category_id: ID de la catégorie
     * - period: today, week, month, year
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Récupération de l'utilisateur connecté
        $user = $request->user();

        // Construction de la requête avec les filtres
        $query = Transaction::where('user_id', $user->id)
            ->with('category'); // Inclut les informations de la catégorie

        // Filtre par type (revenu ou dépense)
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filtre par catégorie
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filtre par période
        if ($request->has('period') && $request->period) {
            $period = $request->period;
            
            switch ($period) {
                case 'today':
                    $query->whereDate('date', today());
                    break;
                case 'week':
                    $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('date', now()->month)
                          ->whereYear('date', now()->year);
                    break;
                case 'year':
                    $query->whereYear('date', now()->year);
                    break;
            }
        }

        // Tri par date décroissante (les plus récentes en premier)
        $query->orderBy('date', 'desc')
              ->orderBy('created_at', 'desc');

        // Pagination optionnelle (par défaut: 50 résultats max)
        $perPage = $request->input('per_page', 50);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'transactions' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Crée une nouvelle transaction
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation des données envoyées
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'date' => 'nullable|date',
        ]);

        // Récupération de l'utilisateur connecté
        $user = $request->user();

        // Création de la transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'] ?? now()->toDateString(),
        ]);

        // Charge la relation category pour la réponse
        $transaction->load('category');

        return response()->json([
            'message' => 'Transaction créée avec succès',
            'transaction' => $transaction,
        ], 201);
    }

    /**
     * Affiche une transaction spécifique
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id)
    {
        // Récupération de l'utilisateur connecté
        $user = Auth::user();

        // Recherche de la transaction avec vérification de propriété
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $user->id)
            ->with('category')
            ->first();

        // Si la transaction n'existe pas
        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction non trouvée',
            ], 404);
        }

        return response()->json([
            'transaction' => $transaction,
        ]);
    }

    /**
     * Met à jour une transaction existante
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $id)
    {
        // Récupération de l'utilisateur connecté
        $user = $request->user();

        // Recherche de la transaction avec vérification de propriété
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        // Si la transaction n'existe pas
        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction non trouvée',
            ], 404);
        }

        // Validation des données
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0.01',
            'type' => 'sometimes|in:income,expense',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'date' => 'nullable|date',
        ]);

        // Mise à jour de la transaction
        $transaction->update($validated);

        // Charge la relation category pour la réponse
        $transaction->load('category');

        return response()->json([
            'message' => 'Transaction mise à jour avec succès',
            'transaction' => $transaction,
        ]);
    }

    /**
     * Supprime une transaction
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id)
    {
        // Récupération de l'utilisateur connecté
        $user = Auth::user();

        // Recherche de la transaction avec vérification de propriété
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        // Si la transaction n'existe pas
        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction non trouvée',
            ], 404);
        }

        // Suppression de la transaction
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction supprimée avec succès',
        ]);
    }

    /**
     * Récupère les transactions récentes (pour la page d'accueil)
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent(Request $request)
    {
        $user = $request->user();
        
        // Nombre de transactions récentes (par défaut: 5)
        $limit = $request->input('limit', 5);

        $transactions = Transaction::where('user_id', $user->id)
            ->with('category')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    /**
     * Calcule le solde actuel de l'utilisateur
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function balance(Request $request)
    {
        $user = $request->user();

        // Calcul des totaux
        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->sum('amount');

        $balance = $totalIncome - $totalExpense;

        return response()->json([
            'balance' => number_format($balance, 2, '.', ''),
            'total_income' => number_format($totalIncome, 2, '.', ''),
            'total_expense' => number_format($totalExpense, 2, '.', ''),
            'currency' => '€',
        ]);
    }
}

