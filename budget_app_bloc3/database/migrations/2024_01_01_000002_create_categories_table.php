<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour créer la table des catégories
 * Les catégories permettent de classer les transactions (loyer, courses, salaire, etc.)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * Crée la table categories avec les champs nécessaires:
     * - name: nom de la catégorie (ex: "Alimentation", "Loisirs")
     * - type: type de catégorie (income = revenu, expense = dépense)
     * - icon: icône associée à la catégorie (ex: bi-cart pour courses)
     * - user_id: ID de l'utilisateur propriétaire (NULL pour catégories globales)
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); // ID auto-incrémenté
            $table->string('name'); // Nom de la catégorie
            $table->enum('type', ['income', 'expense']); // Type: revenu ou dépense
            $table->string('icon')->nullable(); // Icône Bootstrap Icons
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); // Relation utilisateur
            $table->timestamps(); // created_at et updated_at
        });
    }

    /**
     * Reverse the migrations.
     * Supprime la table categories si elle existe
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

