/**
 * TransactionService - Service pour la gestion des transactions
 * Gère les opérations CRUD et les calculs financiers
 * Implémente les concepts POO
 */
const db = require('../utils/db');
const Transaction = require('../models/Transaction');

class TransactionService {
    /**
     * Récupérer toutes les transactions d'un utilisateur
     * @param {number} userId 
     * @param {Object} filters - Filtres optionnels (category_id, period, type)
     * @returns {Promise<Transaction[]>}
     */
    static getTransactions(userId, filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT t.*, c.name as category_name 
                FROM transactions t 
                LEFT JOIN categories c ON t.category_id = c.id 
                WHERE t.user_id = ?
            `;
            let params = [userId];

            // Filtre par catégorie
            if (filters.categoryId) {
                query += ' AND t.category_id = ?';
                params.push(filters.categoryId);
            }

            // Filtre par type (income/expense)
            if (filters.type) {
                query += ' AND t.type = ?';
                params.push(filters.type);
            }

            // Filtre par période
            if (filters.period) {
                if (filters.period === 'today') {
                    query += ' AND DATE(t.created_at) = CURDATE()';
                } else if (filters.period === 'week') {
                    query += ' AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                } else if (filters.period === 'month') {
                    query += ' AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())';
                } else if (filters.period === 'year') {
                    query += ' AND YEAR(t.created_at) = YEAR(CURDATE())';
                }
            }

            // Trier par date décroissante
            query += ' ORDER BY t.created_at DESC';

            db.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Convertir en instances Transaction
                const transactions = results.map(row => Transaction.fromRow(row));
                resolve(transactions);
            });
        });
    }

    /**
     * Récupérer une transaction par ID
     * @param {number} transactionId 
     * @param {number} userId 
     * @returns {Promise<Transaction|null>}
     */
    static getTransactionById(transactionId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ? AND t.user_id = ?',
                [transactionId, userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (results.length === 0) {
                        resolve(null);
                        return;
                    }
                    
                    resolve(Transaction.fromRow(results[0]));
                }
            );
        });
    }

    /**
     * Créer une nouvelle transaction
     * @param {number} userId 
     * @param {Object} data - Données de la transaction
     * @returns {Promise<{success: boolean, transaction?: Transaction, error?: string}>}
     */
    static createTransaction(userId, data) {
        return new Promise((resolve, reject) => {
            const transaction = new Transaction({
                user_id: userId,
                title: data.title,
                amount: data.amount,
                type: data.type,
                category_id: data.category_id || null
            });

            // Valider la transaction
            const validation = transaction.validate();
            if (!validation.valid) {
                resolve({ success: false, error: validation.errors.join(', ') });
                return;
            }

            db.query(
                'INSERT INTO transactions (user_id, title, amount, type, category_id) VALUES (?, ?, ?, ?, ?)',
                [userId, transaction.title, transaction.amount, transaction.type, transaction.categoryId],
                (err, result) => {
                    if (err) {
                        console.error('Erreur création transaction:', err);
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    transaction.id = result.insertId;
                    resolve({
                        success: true,
                        transaction: transaction.toJSON()
                    });
                }
            );
        });
    }

    /**
     * Mettre à jour une transaction
     * @param {number} transactionId 
     * @param {number} userId 
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static updateTransaction(transactionId, userId, data) {
        return new Promise((resolve, reject) => {
            const transaction = new Transaction({
                id: transactionId,
                user_id: userId,
                title: data.title,
                amount: data.amount,
                type: data.type,
                category_id: data.category_id || null
            });

            // Valider la transaction
            const validation = transaction.validate();
            if (!validation.valid) {
                resolve({ success: false, error: validation.errors.join(', ') });
                return;
            }

            db.query(
                'UPDATE transactions SET title = ?, amount = ?, type = ?, category_id = ? WHERE id = ? AND user_id = ?',
                [transaction.title, transaction.amount, transaction.type, transaction.categoryId, transactionId, userId],
                (err, result) => {
                    if (err) {
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Transaction non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Supprimer une transaction
     * @param {number} transactionId 
     * @param {number} userId 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static deleteTransaction(transactionId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM transactions WHERE id = ? AND user_id = ?',
                [transactionId, userId],
                (err, result) => {
                    if (err) {
                        reject({ success: false, error: 'Erreur serveur' });
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Transaction non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Calculer le solde total d'un utilisateur
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static getBalance(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                FROM transactions
                WHERE user_id = ?
            `;

            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                const totalIncome = parseFloat(results[0].total_income) || 0;
                const totalExpense = parseFloat(results[0].total_expense) || 0;
                const balance = totalIncome - totalExpense;

                resolve(balance);
            });
        });
    }

    /**
     * Obtenir les statistiques par catégorie
     * @param {number} userId 
     * @param {string} type - 'income' ou 'expense'
     * @param {string} period - Période optionnelle
     * @returns {Promise<Object[]>}
     */
    static getStatsByCategory(userId, type, period = 'month') {
        return new Promise((resolve, reject) => {
            let dateFilter = '';
            if (period === 'month') {
                dateFilter = 'AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())';
            } else if (period === 'year') {
                dateFilter = 'AND YEAR(t.created_at) = YEAR(CURDATE())';
            }

            const query = `
                SELECT 
                    c.id,
                    c.name as category_name,
                    COALESCE(SUM(t.amount), 0) as total
                FROM categories c
                LEFT JOIN transactions t ON c.id = t.category_id AND t.type = ? AND t.user_id = ? ${dateFilter}
                WHERE c.user_id = ? OR c.user_id IS NULL
                GROUP BY c.id, c.name
                HAVING total > 0
                ORDER BY total DESC
            `;

            db.query(query, [type, userId, userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    /**
     * Obtenir l'évolution mensuelle des transactions
     * @param {number} userId 
     * @param {number} months - Nombre de mois à récupérer
     * @returns {Promise<Object[]>}
     */
    static getMonthlyEvolution(userId, months = 12) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE_FORMAT(t.created_at, '%Y-%m') as month,
                    DATE_FORMAT(t.created_at, '%M') as month_name,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions t
                WHERE t.user_id = ? 
                    AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), DATE_FORMAT(t.created_at, '%M')
                ORDER BY month ASC
            `;

            db.query(query, [userId, months], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    /**
     * Obtenir les dernières transactions
     * @param {number} userId 
     * @param {number} limit 
     * @returns {Promise<Transaction[]>}
     */
    static getRecentTransactions(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, c.name as category_name 
                FROM transactions t 
                LEFT JOIN categories c ON t.category_id = c.id 
                WHERE t.user_id = ?
                ORDER BY t.created_at DESC
                LIMIT ?
            `;

            db.query(query, [userId, limit], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const transactions = results.map(row => Transaction.fromRow(row));
                resolve(transactions);
            });
        });
    }
}

module.exports = TransactionService;

