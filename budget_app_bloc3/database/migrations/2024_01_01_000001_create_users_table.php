<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour créer la table des utilisateurs
 * Cette table stocke les informations des utilisateurs de l'application Budget App
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * Crée la table users avec les champs nécessaires:
     * - name: nom de l'utilisateur
     * - email: adresse email unique
     * - password: mot de passe chiffré
     * - role: rôle de l'utilisateur (user, admin)
     * - remember_token: token pour la fonctionnalité "se souvenir de moi"
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // ID auto-incrémenté
            $table->string('name'); // Nom de l'utilisateur
            $table->string('email')->unique(); // Email unique
            $table->string('password'); // Mot de passe chiffré
            $table->string('role')->default('user'); // Rôle par défaut: user
            $table->rememberToken(); // Token pour "se souvenir de moi"
            $table->timestamps(); // created_at et updated_at
        });
    }

    /**
     * Reverse the migrations.
     * Supprime la table users si elle existe
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

