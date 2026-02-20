<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour créer la table des transactions
 * Les transactions représentent les mouvements financiers (revenus/dépenses)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * Crée la table transactions avec les champs nécessaires:
     * - user_id: ID de l'utilisateur propriétaire de la transaction
     * - title: titre/description de la transaction
     * - amount: montant de la transaction
     * - type: type (income = revenu, expense = dépense)
     * - category_id: ID de la catégorie associée (optionnel)
     * - description: description détaillée (optionnel)
     * - date: date de la transaction
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id(); // ID auto-incrémenté
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Relation utilisateur
            $table->string('title'); // Titre de la transaction
            $table->decimal('amount', 10, 2); // Montant avec 2 décimales
            $table->enum('type', ['income', 'expense']); // Type: revenu ou dépense
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null'); // Relation catégorie
            $table->text('description')->nullable(); // Description optionnelle
            $table->date('date')->useCurrent(); // Date de la transaction (par défaut: aujourd'hui)
            $table->timestamps(); // created_at et updated_at
        });

        /**
         * Ajout d'index pour optimiser les requêtes fréquentes:
         * - user_id: pour récupérer les transactions d'un utilisateur
         * - type: pour filtrer par type (revenus/dépenses)
         * - date: pour les requêtes par période
         * - (user_id, date): combinaison pour les requêtes par période par utilisateur
         */
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('type');
            $table->index('date');
            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     * Supprime la table transactions si elle existe
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

