/**
 * StatsService - Service pour les statistiques et rapports financiers
 * Génère des graphiques et des rapports visuels
 * Implémente les concepts POO
 */
const db = require('../utils/db');

class StatsService {
    /**
     * Obtenir les statistiques globales de l'utilisateur
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static async getOverallStats(userId) {
        try {
            const balance = await this.getBalance(userId);
            const totalIncome = await this.getTotalByType(userId, 'income');
            const totalExpense = await this.getTotalByType(userId, 'expense');
            const transactionCount = await this.getTransactionCount(userId);
            const averageTransaction = await this.getAverageTransaction(userId);

            return {
                balance: parseFloat(balance).toFixed(2),
                totalIncome: parseFloat(totalIncome).toFixed(2),
                totalExpense: parseFloat(totalExpense).toFixed(2),
                transactionCount,
                averageTransaction: parseFloat(averageTransaction).toFixed(2),
                savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0
            };
        } catch (error) {
            console.error('Erreur getOverallStats:', error);
            throw error;
        }
    }

    /**
     * Calculer le solde
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static getBalance(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
                FROM transactions
                WHERE user_id = ?
            `;

            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0].balance || 0);
            });
        });
    }

    /**
     * Obtenir le total par type de transaction
     * @param {number} userId 
     * @param {string} type - 'income' ou 'expense'
     * @returns {Promise<number>}
     */
    static getTotalByType(userId, type) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE user_id = ? AND type = ?
            `;

            db.query(query, [userId, type], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0].total || 0);
            });
        });
    }

    /**
     * Obtenir le nombre de transactions
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static getTransactionCount(userId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ?`;

            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0].count || 0);
            });
        });
    }

    /**
     * Obtenir la moyenne des transactions
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static getAverageTransaction(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COALESCE(AVG(amount), 0) as average
                FROM transactions
                WHERE user_id = ?
            `;

            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0].average || 0);
            });
        });
    }

    /**
     * Obtenir les statistiques par catégorie (pour graphiques)
     * @param {number} userId 
     * @param {string} type - 'income' ou 'expense'
     * @param {string} period - 'month', 'year', ou 'all'
     * @returns {Promise<Object[]>}
     */
    static getCategoryStats(userId, type, period = 'month') {
        return new Promise((resolve, reject) => {
            let dateFilter = '';
            if (period === 'month') {
                dateFilter = 'AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())';
            } else if (period === 'year') {
                dateFilter = 'AND YEAR(t.created_at) = YEAR(CURDATE())';
            }

            const query = `
                SELECT 
                    COALESCE(c.name, 'Sans catégorie') as category_name,
                    COALESCE(SUM(t.amount), 0) as total,
                    COUNT(t.id) as count
                FROM categories c
                LEFT JOIN transactions t ON c.id = t.category_id AND t.type = ? AND t.user_id = ? ${dateFilter}
                WHERE c.user_id = ? OR c.user_id IS NULL
                GROUP BY c.id, c.name
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
     * Obtenir l'évolution mensuelle (pour graphiques)
     * @param {number} userId 
     * @param {number} months - Nombre de mois
     * @returns {Promise<Object[]>}
     */
    static getMonthlyEvolution(userId, months = 12) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE_FORMAT(t.created_at, '%Y-%m') as month,
                    DATE_FORMAT(t.created_at, '%M') as month_name,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                    COUNT(*) as count
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
     * Obtenir les statistiques journalières (7 derniers jours)
     * @param {number} userId 
     * @returns {Promise<Object[]>}
     */
    static getDailyStats(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE(t.created_at) as date,
                    DAYNAME(t.created_at) as day_name,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions t
                WHERE t.user_id = ? 
                    AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(t.created_at), DAYNAME(t.created_at)
                ORDER BY date ASC
            `;

            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    /**
     * Obtenir les plus grandes dépenses
     * @param {number} userId 
     * @param {number} limit 
     * @returns {Promise<Object[]>}
     */
    static getTopExpenses(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, c.name as category_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.type = 'expense'
                ORDER BY t.amount DESC
                LIMIT ?
            `;

            db.query(query, [userId, limit], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    /**
     * Obtenir les plus grands revenus
     * @param {number} userId 
     * @param {number} limit 
     * @returns {Promise<Object[]>}
     */
    static getTopIncome(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, c.name as category_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.type = 'income'
                ORDER BY t.amount DESC
                LIMIT ?
            `;

            db.query(query, [userId, limit], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    /**
     * Obtenir les données pour le graphique en secteurs (pie chart)
     * @param {number} userId 
     * @param {string} type - 'income' ou 'expense'
     * @returns {Promise<Object>}
     */
    static getPieChartData(userId, type = 'expense') {
        return new Promise(async (resolve, reject) => {
            try {
                const categoryStats = await this.getCategoryStats(userId, type, 'month');
                
                const labels = categoryStats.map(stat => stat.category_name);
                const data = categoryStats.map(stat => parseFloat(stat.total));
                
                resolve({
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                        ]
                    }]
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Obtenir les données pour le graphique linéaire (évolution)
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static getLineChartData(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const monthlyData = await this.getMonthlyEvolution(userId, 6);
                
                const labels = monthlyData.map(stat => stat.month_name);
                const incomeData = monthlyData.map(stat => parseFloat(stat.income));
                const expenseData = monthlyData.map(stat => parseFloat(stat.expense));
                
                resolve({
                    labels,
                    datasets: [
                        {
                            label: 'Revenus',
                            data: incomeData,
                            borderColor: '#4BC0C0',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true
                        },
                        {
                            label: 'Dépenses',
                            data: expenseData,
                            borderColor: '#FF6384',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: true
                        }
                    ]
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = StatsService;

