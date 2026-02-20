<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Contrôleur AuthController - Gestion de l'authentification
 * 
 * Gère les opérations d'authentification:
 * - Inscription d'un nouvel utilisateur
 * - Connexion (login)
 * - Déconnexion (logout)
 * - Récupération du profil utilisateur
 * 
 * Ce contrôleur utilise Laravel Sanctum pour l'authentification par tokens API
 */

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     * 
     * Crée un nouveau compte utilisateur et retourne un token d'API
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validation des données envoyées par l'utilisateur
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Création de l'utilisateur avec le mot de passe chiffré
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user', // Rôle par défaut
        ]);

        // Génération d'un token API personnel (Sanctum)
        $token = $user->createToken('auth-token')->plainTextToken;

        // Retourne la réponse avec le token
        return response()->json([
            'message' => 'Inscription réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant
     * 
     * Vérifie les identifiants et retourne un token d'API
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validation des données
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Recherche de l'utilisateur par email
        $user = User::where('email', $request->email)->first();

        // Vérification du mot de passe
        // Si l'utilisateur n'existe pas ou le mot de passe est incorrect
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Suppression des tokens existants (optionnel - sécurité)
        // $user->tokens()->delete();

        // Génération d'un nouveau token API
        $token = $user->createToken('auth-token')->plainTextToken;

        // Retourne la réponse avec le token
        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion de l'utilisateur
     * 
     * Supprime le token d'API actuel
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Suppression du token actuel (celui qui a été utilisé pour la requête)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Retourne les informations de l'utilisateur connecté
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Mise à jour du profil utilisateur
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validation des données
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        // Mise à jour des champs
        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour',
            'user' => $user,
        ]);
    }

    /**
     * Changement du mot de passe
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        // Validation des données
        $validated = $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Vérification de l'ancien mot de passe
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        // Mise à jour du mot de passe
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Mot de passe changé avec succès',
        ]);
    }
}

