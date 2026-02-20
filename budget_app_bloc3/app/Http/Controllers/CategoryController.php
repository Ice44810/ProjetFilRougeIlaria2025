<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Contrôleur CategoryController - Gestion des catégories
 * 
 * Gère les opérations CRUD sur les catégories:
 * - Liste des catégories (globales + personnalisées)
 * - Création d'une nouvelle catégorie
 * - Affichage d'une catégorie spécifique
 * - Mise à jour d'une catégorie
 * - Suppression d'une catégorie
 * 
 * Note: Les catégories globales (user_id = null) ne peuvent pas être supprimées
 */
class CategoryController extends Controller
{
    /**
     * Récupère toutes les catégories disponibles pour l'utilisateur
     * 
     * Retourne:
     * - Les catégories globales (pour tous les utilisateurs)
     * - Les catégories personnalisées de l'utilisateur
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Récupère les catégories globales et celles de l'utilisateur
        $categories = Category::whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Récupère les catégories filtrées par type
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexByType(Request $request)
    {
        $user = $request->user();
        $type = $request->input('type', 'expense'); // expense ou income
        
        $categories = Category::where(function ($query) use ($user) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', $user->id);
            })
            ->where('type', $type)
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Crée une nouvelle catégorie personnalisée
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,NULL,id,user_id,' . $request->user()->id,
            'type' => 'required|in:income,expense',
            'icon' => 'nullable|string|max:100',
        ]);

        // Création de la catégorie
        $category = Category::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'icon' => $validated['icon'] ?? null,
            'user_id' => $request->user()->id, // Catégorie liée à l'utilisateur
        ]);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category,
        ], 201);
    }

    /**
     * Affiche une catégorie spécifique
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id)
    {
        $user = Auth::user();
        
        // Recherche de la catégorie (globale ou appartenant à l'utilisateur)
        $category = Category::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', $user->id);
            })
            ->first();

        if (!$category) {
            return response()->json([
                'message' => 'Catégorie non trouvée',
            ], 404);
        }

        return response()->json([
            'category' => $category,
        ]);
    }

    /**
     * Met à jour une catégorie existante
     * 
     * Note: Les catégories globales ne peuvent être mises à jour que par un admin
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $id)
    {
        $user = $request->user();
        
        // Recherche de la catégorie
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Catégorie non trouvée',
            ], 404);
        }

        // Vérification des droits: admin ou propriétaire
        if ($category->user_id !== null && $category->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non autorisé à modifier cette catégorie',
            ], 403);
        }

        // Validation des données
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:100',
        ]);

        // Mise à jour de la catégorie
        $category->update($validated);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'category' => $category,
        ]);
    }

    /**
     * Supprime une catégorie
     * 
     * Note: Les catégories globales ne peuvent pas être supprimées
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id)
    {
        $user = Auth::user();
        
        // Recherche de la catégorie
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Catégorie non trouvée',
            ], 404);
        }

        // Les catégories globales ne peuvent pas être supprimées
        if ($category->user_id === null) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie globale',
            ], 403);
        }

        // Vérification des droits
        if ($category->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non autorisé à supprimer cette catégorie',
            ], 403);
        }

        // Suppression de la catégorie
        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}

