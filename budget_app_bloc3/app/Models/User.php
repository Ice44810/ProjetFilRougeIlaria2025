<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modèle User - Représente un utilisateur de l'application Budget App
 * 
 * Ce modèle gère les utilisateurs avec leurs:
 * - Informations personnelles (nom, email)
 * - Rôle dans l'application (user, admin)
 * - Relations avec les transactions et catégories
 */
class User extends Authenticatable
{
    /** 
     * Utilisation des traits Laravel pour les fonctionnalités:
     * - HasFactory: création de factories pour les tests
     * - Notifiable: gestion des notifications
     * - HasApiTokens: authentification par token API
     */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Les attributs qui peuvent être assignés en masse (mass assignment)
     * Attention: sensitive fields comme password doivent être exclus
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Rôle de l'utilisateur (user, admin)
    ];

    /**
     * Les attributs qui doivent être cachés lors de la sérialisation
     * (ex: quand on convertit en JSON pour l'API)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Les attributs qui doivent être castés (convertis) vers un type spécifique
     * - email_verified_at: converti en objet Carbon pour manipuler les dates
     * - password: automatiquement hashé lors de l'assignation
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relation: Un utilisateur peut avoir plusieurs transactions
     * Une transaction appartient à un utilisateur
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Relation: Un utilisateur peut avoir plusieurs catégories personnalisées
     * Une catégorie appartient à un utilisateur
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     * 
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Calcule le solde total de l'utilisateur
     * Solde = total des revenus - total des dépenses
     * 
     * @return float
     */
    public function getBalance(): float
    {
        $income = $this->transactions()
            ->where('type', 'income')
            ->sum('amount');
            
        $expense = $this->transactions()
            ->where('type', 'expense')
            ->sum('amount');
            
        return $income - $expense;
    }
}
