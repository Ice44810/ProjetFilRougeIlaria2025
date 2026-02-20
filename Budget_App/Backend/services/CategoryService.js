/**
 * CategoryService - Service pour la gestion des catégories
 * Gère les opérations CRUD pour les catégories de transactions
 * Implémente les concepts POO
 */
const db = require('../utils/db');
const Category = require('../models/Category');

class CategoryService {
    /**
     * Récupérer toutes les catégories d'un utilisateur
     * @param {number} userId 
     * @returns {Promise<Category[]>}
     */
    static getCategories(userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
                [userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    const categories = results.map(row => Category.fromRow(row));
                    resolve(categories);
                }
            );
        });
    }

    /**
     * Récupérer une catégorie par ID
     * @param {number} categoryId 
     * @param {number} userId 
     * @returns {Promise<Category|null>}
     */
    static getCategoryById(categoryId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (results.length === 0) {
                        resolve(null);
                        return;
                    }
                    
                    resolve(Category.fromRow(results[0]));
                }
            );
        });
    }

    /**
     * Créer une nouvelle catégorie
     * @param {number} userId 
     * @param {string} name - Nom de la catégorie
     * @returns {Promise<{success: boolean, category?: Category, error?: string}>}
     */
    static createCategory(userId, name) {
        return new Promise((resolve, reject) => {
            const category = new Category({
                name: name,
                user_id: userId
            });

            // Valider la catégorie
            const validation = category.validate();
            if (!validation.valid) {
                resolve({ success: false, error: validation.errors.join(', ') });
                return;
            }

            db.query(
                'INSERT INTO categories (name, user_id) VALUES (?, ?)',
                [category.name, userId],
                (err, result) => {
                    if (err) {
                        console.error('Erreur création catégorie:', err);
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    category.id = result.insertId;
                    resolve({
                        success: true,
                        category: category.toJSON()
                    });
                }
            );
        });
    }

    /**
     * Mettre à jour une catégorie
     * @param {number} categoryId 
     * @param {number} userId 
     * @param {string} name - Nouveau nom
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static updateCategory(categoryId, userId, name) {
        return new Promise((resolve, reject) => {
            const category = new Category({
                id: categoryId,
                name: name,
                user_id: userId
            });

            // Valider la catégorie
            const validation = category.validate();
            if (!validation.valid) {
                resolve({ success: false, error: validation.errors.join(', ') });
                return;
            }

            db.query(
                'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
                [name, categoryId, userId],
                (err, result) => {
                    if (err) {
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Catégorie non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Supprimer une catégorie
     * @param {number} categoryId 
     * @param {number} userId 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static deleteCategory(categoryId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId],
                (err, result) => {
                    if (err) {
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Catégorie non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Créer des catégories par défaut pour un nouvel utilisateur
     * @param {number} userId 
     * @returns {Promise<void>}
     */
    static createDefaultCategories(userId) {
        return new Promise((resolve, reject) => {
            const defaultCategories = [
                { name: 'Salaire', type: 'income' },
                { name: 'Investissement', type: 'income' },
                { name: 'Autre Revenu', type: 'income' },
                { name: 'Alimentation', type: 'expense' },
                { name: 'Transport', type: 'expense' },
                { name: 'Loyer', type: 'expense' },
                { name: 'Factures', type: 'expense' },
                { name: 'Loisirs', type: 'expense' },
                { name: 'Shopping', type: 'expense' },
                { name: 'Santé', type: 'expense' },
                { name: 'Autre Dépense', type: 'expense' }
            ];

            const values = defaultCategories.map(cat => [cat.name, userId]);
            
            db.query(
                'INSERT INTO categories (name, user_id) VALUES ?',
                [values],
                (err, result) => {
                    if (err) {
                        console.error('Erreur création catégories par défaut:', err);
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    }
}

module.exports = CategoryService;

