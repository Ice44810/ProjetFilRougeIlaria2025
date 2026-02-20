<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

/**
 * Contrôleur StatsController - Gestion des statistiques financières
 * 
 * Gère les calculs et affichage des statistiques:
 * - Balance globale (revenus - dépenses)
 * - Statistiques par catégorie
 * - Évolution mensuelle
 * - Données pour les graphiques (camembert, ligne)
 * - Page d'accueil (résumé rapide)
 */
class StatsController extends Controller
{
    /**
     * Retourne les statistiques générales de l'utilisateur
     * 
     * Inclut:
     * - Total des revenus
     * - Total des dépenses
     * - Solde actuel
     * - Nombre de transactions
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Calcul des statistiques globales
        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->sum('amount');
            
        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->sum('amount');
            
        $balance = $totalIncome - $totalExpense;
        
        $transactionCount = Transaction::where('user_id', $user->id)->count();

        return response()->json([
            'balance' => number_format($balance, 2, '.', ''),
            'total_income' => number_format($totalIncome, 2, '.', ''),
            'total_expense' => number_format($totalExpense, 2, '.', ''),
            'transaction_count' => $transactionCount,
            'currency' => '€',
        ]);
    }

    /**
     * Retourne les statistiques par catégorie
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories(Request $request)
    {
        $user = $request->user();
        
        // Type de transaction (expense ou income)
        $type = $request->input('type', 'expense');
        
        // Période (month, year, ou null pour tout)
        $period = $request->input('period', 'month');
        
        // Construction de la requête
        $query = Transaction::where('user_id', $user->id)
            ->where('type', $type);
        
        // Application du filtre de période
        if ($period === 'month') {
            $query->whereMonth('date', now()->month)
                  ->whereYear('date', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('date', now()->year);
        }
        
        // Regroupement par catégorie avec somme
        $stats = $query->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();
        
        // Enrichissement avec les noms de catégories
        $result = $stats->map(function ($stat) {
            $category = Category::find($stat->category_id);
            return [
                'category_id' => $stat->category_id,
                'category_name' => $category ? $category->name : 'Non catégorisé',
                'category_icon' => $category ? $category->icon : null,
                'total' => number_format($stat->total, 2, '.', ''),
            ];
        });

        return response()->json([
            'type' => $type,
            'period' => $period,
            'categories' => $result,
        ]);
    }

    /**
     * Retourne l'évolution mensuelle des revenus et dépenses
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function monthly(Request $request)
    {
        $user = $request->user();
        
        // Nombre de mois à récupérer (par défaut: 6)
        $months = $request->input('months', 6);
        
        // Requête pour obtenir l'évolution mensuelle
        $data = Transaction::where('user_id', $user->id)
            ->where('date', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw('
                strftime("%Y-%m", date) as month,
                SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense
            ')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        // Formatage des résultats
        $result = $data->map(function ($item) {
            $date = Carbon::createFromFormat('Y-m', $item->month);
            return [
                'month' => $item->month,
                'month_name' => $date->locale('fr')->monthName,
                'income' => number_format($item->income, 2, '.', ''),
                'expense' => number_format($item->expense, 2, '.', ''),
            ];
        });

        return response()->json([
            'months' => $months,
            'data' => $result,
        ]);
    }

    /**
     * Retourne les données pour le graphique camembert (pie chart)
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pie(Request $request)
    {
        $user = $request->user();
        
        $type = $request->input('type', 'expense');
        $period = $request->input('period', 'month');
        
        $query = Transaction::where('user_id', $user->id)
            ->where('type', $type);
        
        if ($period === 'month') {
            $query->whereMonth('date', now()->month)
                  ->whereYear('date', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('date', now()->year);
        }
        
        $data = $query->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get();
        
        $result = $data->map(function ($item) {
            $category = Category::find($item->category_id);
            return [
                'id' => $item->category_id,
                'name' => $category ? $category->name : 'Autre',
                'value' => number_format($item->total, 2, '.', ''),
            ];
        })->filter(function ($item) {
            return $item['value'] > 0;
        })->values();

        return response()->json([
            'type' => $type,
            'data' => $result,
        ]);
    }

    /**
     * Retourne les données pour le graphique linéaire (line chart)
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function line(Request $request)
    {
        $user = $request->user();
        
        $months = $request->input('months', 12);
        
        $data = Transaction::where('user_id', $user->id)
            ->where('date', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw('
                strftime("%Y-%m", date) as month,
                SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense
            ')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        // Calcul du solde cumulatif
        $cumulative = 0;
        $result = $data->map(function ($item) use (&$cumulative) {
            $monthIncome = floatval($item->income);
            $monthExpense = floatval($item->expense);
            $cumulative += ($monthIncome - $monthExpense);
            
            $date = Carbon::createFromFormat('Y-m', $item->month);
            return [
                'month' => $item->month,
                'month_name' => $date->locale('fr')->format('M'),
                'income' => $monthIncome,
                'expense' => $monthExpense,
                'balance' => $cumulative,
            ];
        });

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Retourne les données pour la page d'accueil (home)
     * 
     * Inclut:
     * - Solde actuel
     * - Récompenses (points de fidélité - ici toujours 0 par défaut)
     * - Dernières transactions
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function home(Request $request)
    {
        $user = $request->user();
        
        // Calcul du solde
        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->sum('amount');
            
        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->sum('amount');
            
        $balance = $totalIncome - $totalExpense;
        
        // Récupération des dernières transactions
        $lastTransactions = Transaction::where('user_id', $user->id)
            ->with('category')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'amount' => $t->isIncome() ? $t->amount : -$t->amount,
                    'type' => $t->type,
                    'category_name' => $t->category ? $t->category->name : null,
                    'created_at' => $t->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'balance' => number_format($balance, 2, '.', ''),
            'currency' => '€',
            'rewards' => 0, // Points de fidélité (peut être implémenté séparément)
            'lastTransactions' => $lastTransactions,
        ]);
    }

    /**
     * Retourne le solde actuel de l'utilisateur
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function balance(Request $request)
    {
        $user = $request->user();
        
        $balance = $user->getBalance();
        
        return response()->json([
            'balance' => number_format($balance, 2, '.', ''),
            'currency' => '€',
        ]);
    }
}

