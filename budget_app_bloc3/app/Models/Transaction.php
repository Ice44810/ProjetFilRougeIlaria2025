<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Transaction - Représente une transaction financière
 * 
 * Une transaction peut être:
 * - Un revenu (income): argent reçu (salaire, cadeau, etc.)
 * - Une dépense (expense): argent dépensé (courses, loyer, etc.)
 * 
 * Relations:
 * - Appartient à un utilisateur (User)
 * - Appartient à une catégorie (Category) - optionnel
 */
class Transaction extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'user_id',
        'title',
        'amount',
        'type',
        'category_id',
        'description',
        'date',
    ];

    /**
     * Les attributs qui doivent être castés vers des types spécifiques
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2', // Montant avec 2 décimales
            'date' => 'date', // Date de la transaction
        ];
    }

    /**
     * Constantes pour les types de transactions
     */
    public const TYPE_INCOME = 'income';
    public const TYPE_EXPENSE = 'expense';

    /**
     * Relation: Cette transaction appartient à un utilisateur
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation: Cette transaction peut appartenir à une catégorie
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Vérifie si la transaction est un revenu
     * 
     * @return bool
     */
    public function isIncome(): bool
    {
        return $this->type === self::TYPE_INCOME;
    }

    /**
     * Vérifie si la transaction est une dépense
     * 
     * @return bool
     */
    public function isExpense(): bool
    {
        return $this->type === self::TYPE_EXPENSE;
    }

    /**
     * Retourne le montant signé:
     * - Positif pour les revenus
     * - Négatif pour les dépenses
     * 
     * @return float
     */
    public function getSignedAmount(): float
    {
        return $this->isIncome() ? $this->amount : -$this->amount;
    }

    /**
     * Retourne le montant formaté avec le signe et la devise
     * Ex: +500.00 € ou -50.00 €
     * 
     * @param string $currency
     * @return string
     */
    public function getFormattedAmount(string $currency = '€'): string
    {
        $sign = $this->isIncome() ? '+' : '-';
        return sprintf('%s%.2f %s', $sign, $this->amount, $currency);
    }

    /**
     * Scope pour filtrer les revenus uniquement
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIncome($query)
    {
        return $query->where('type', self::TYPE_INCOME);
    }

    /**
     * Scope pour filtrer les dépenses uniquement
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExpense($query)
    {
        return $query->where('type', self::TYPE_EXPENSE);
    }

    /**
     * Scope pour filtrer par période
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $period (today, week, month, year)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePeriod($query, string $period)
    {
        switch ($period) {
            case 'today':
                return $query->whereDate('date', today());
            case 'week':
                return $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
            case 'month':
                return $query->whereMonth('date', now()->month)
                             ->whereYear('date', now()->year);
            case 'year':
                return $query->whereYear('date', now()->year);
            default:
                return $query;
        }
    }
}

