<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder pour les données initiales de l'application Budget App
 * 
 * Ce seeder crée:
 * - Un utilisateur de test
 * - Des catégories globales (pour tous les utilisateurs)
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Crée les données initiales nécessaires au fonctionnement de l'application
     */
    public function run(): void
    {
        // ==================== Création d'un utilisateur de test ====================
        DB::table('users')->insert([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ==================== Catégories de revenus (globales) ====================
        $incomeCategories = [
            ['name' => 'Salaire', 'type' => 'income', 'icon' => 'bi-briefcase'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'bi-laptop'],
            ['name' => 'Investissements', 'type' => 'income', 'icon' => 'bi-graph-up-arrow'],
            ['name' => 'Cadeaux', 'type' => 'income', 'icon' => 'bi-gift'],
            ['name' => 'Remboursement', 'type' => 'income', 'icon' => 'bi-arrow-return-left'],
            ['name' => 'Autre revenu', 'type' => 'income', 'icon' => 'bi-wallet2'],
        ];

        foreach ($incomeCategories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'type' => $category['type'],
                'icon' => $category['icon'],
                'user_id' => null, // Catégorie globale
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ==================== Catégories de dépenses (globales) ====================
        $expenseCategories = [
            ['name' => 'Alimentation', 'type' => 'expense', 'icon' => 'bi-cart'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bi-car'],
            ['name' => 'Loisirs', 'type' => 'expense', 'icon' => 'bi-controller'],
            ['name' => 'Logement', 'type' => 'expense', 'icon' => 'bi-house'],
            ['name' => 'Factures', 'type' => 'expense', 'icon' => 'bi-receipt'],
            ['name' => 'Santé', 'type' => 'expense', 'icon' => 'bi-heart-pulse'],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => 'bi-bag'],
            ['name' => 'Éducation', 'type' => 'expense', 'icon' => 'bi-book'],
            ['name' => 'Abonnements', 'type' => 'expense', 'icon' => 'bi-credit-card'],
            ['name' => 'Autre dépense', 'type' => 'expense', 'icon' => 'bi-wallet'],
        ];

        foreach ($expenseCategories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'type' => $category['type'],
                'icon' => $category['icon'],
                'user_id' => null, // Catégorie globale
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ==================== Transactions de test ====================
        // Transactions du mois en cours
        DB::table('transactions')->insert([
            'user_id' => 1,
            'title' => 'Salaire mensuel',
            'amount' => 3500.00,
            'type' => 'income',
            'category_id' => 1, // Salaire
            'description' => 'Salaire du mois en cours',
            'date' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('transactions')->insert([
            'user_id' => 1,
            'title' => 'Courses',
            'amount' => 150.00,
            'type' => 'expense',
            'category_id' => 7, // Alimentation
            'description' => 'Courses hebdomadaires',
            'date' => now()->subDays(2)->toDateString(),
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        DB::table('transactions')->insert([
            'user_id' => 1,
            'title' => 'Essence',
            'amount' => 60.00,
            'type' => 'expense',
            'category_id' => 8, // Transport
            'description' => 'Plein d\'essence',
            'date' => now()->subDays(3)->toDateString(),
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        // Transactions du mois dernier
        DB::table('transactions')->insert([
            'user_id' => 1,
            'title' => 'Facture électricité',
            'amount' => 120.00,
            'type' => 'expense',
            'category_id' => 10, // Factures
            'description' => 'Électricité du mois dernier',
            'date' => now()->subMonth()->startOfMonth()->addDays(15)->toDateString(),
            'created_at' => now()->subMonth(),
            'updated_at' => now()->subMonth(),
        ]);

        DB::table('transactions')->insert([
            'user_id' => 1,
            'title' => 'Salaire mensuel',
            'amount' => 3500.00,
            'type' => 'income',
            'category_id' => 1,
            'description' => 'Salaire du mois dernier',
            'date' => now()->subMonth()->toDateString(),
            'created_at' => now()->subMonth(),
            'updated_at' => now()->subMonth(),
        ]);
    }
}

