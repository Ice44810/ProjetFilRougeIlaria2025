<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Category - Représente une catégorie de transactions
 * 
 * Les catégories permettent d'organiser les transactions:
 * - Revenus: Salaire, Cadeaux, Investissements, etc.
 * - Dépenses: Alimentation, Transport, Loisirs, etc.
 * 
 * Relations:
 * - Appartient à un utilisateur (User) - optionnel pour catégories globales
 * - A plusieurs transactions (Transaction)
 */
class Category extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'name',
        'type',
        'icon',
        'user_id',
    ];

    /**
     * Constantes pour les types de catégories
     */
    public const TYPE_INCOME = 'income';
    public const TYPE_EXPENSE = 'expense';

    /**
     * Relation: Cette catégorie appartient à un utilisateur
     * Si user_id est null, c'est une catégorie globale (disponible pour tous)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation: Une catégorie peut avoir plusieurs transactions
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope pour filtrer les catégories de revenus
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIncome($query)
    {
        return $query->where('type', self::TYPE_INCOME);
    }

    /**
     * Scope pour filtrer les catégories de dépenses
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExpense($query)
    {
        return $query->where('type', self::TYPE_EXPENSE);
    }

    /**
     * Scope pour obtenir les catégories globales (non liées à un utilisateur)
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Scope pour obtenir les catégories d'un utilisateur spécifique
     * Inclut aussi les catégories globales
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhereNull('user_id');
        });
    }

    /**
     * Retourne le montant total des transactions dans cette catégorie
     * pour un utilisateur donné
     * 
     * @param int $userId
     * @return float
     */
    public function getTotalForUser(int $userId): float
    {
        return $this->transactions()
            ->where('user_id', $userId)
            ->sum('amount');
    }

    /**
     * Retourne vrai si la catégorie est globale (pour tous les utilisateurs)
     * 
     * @return bool
     */
    public function isGlobal(): bool
    {
        return is_null($this->user_id);
    }
}

