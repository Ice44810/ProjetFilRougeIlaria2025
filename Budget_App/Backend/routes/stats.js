/**
 * Stats Router - Gestion des routes de statistiques
 */
const StatsService = require('../services/StatsService');
const TransactionService = require('../services/TransactionService');
const db = require('../utils/db');

function handleStats(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // ================= POST /api/topup =================
    if (path === '/api/topup' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { parse } = require('querystring');
            const data = parse(body);
            
            const amount = parseFloat(data.amount);
            
            if (!amount || amount <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Montant invalide' }));
                return;
            }

            try {
                // Créer une transaction de type "income" pour le topup
                const result = await TransactionService.createTransaction(userSession.userId, {
                    title: 'Recharge de compte',
                    amount: amount,
                    type: 'income',
                    category_id: null
                });

                if (result.success) {
                    // Récupérer le nouveau solde
                    const newBalance = await TransactionService.getBalance(userSession.userId);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Recharge effectuée avec succès',
                        balance: parseFloat(newBalance).toFixed(2),
                        transactionId: result.transaction?.id
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: result.error }));
                }
            } catch (err) {
                console.error('Erreur topup:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Erreur serveur' }));
            }
        });
        return;
    }

    // ================= GET /api/stats =================
    if (path === '/api/stats' && method === 'GET') {
        const filters = {
            type: url.searchParams.get('type'),
            period: url.searchParams.get('period')
        };

        StatsService.getOverallStats(userSession.userId, filters)
            .then(stats => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stats));
            })
            .catch(err => {
                console.error('Erreur stats:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/stats/categories =================
    if (path === '/api/stats/categories' && method === 'GET') {
        const type = url.searchParams.get('type') || 'expense';
        const period = url.searchParams.get('period') || 'month';

        StatsService.getCategoryStats(userSession.userId, type, period)
            .then(stats => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stats));
            })
            .catch(err => {
                console.error('Erreur stats categories:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/stats/monthly =================
    if (path === '/api/stats/monthly' && method === 'GET') {
        const months = parseInt(url.searchParams.get('months')) || 6;

        StatsService.getMonthlyEvolution(userSession.userId, months)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch(err => {
                console.error('Erreur stats monthly:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/stats/pie =================
    if (path === '/api/stats/pie' && method === 'GET') {
        const type = url.searchParams.get('type') || 'expense';

        StatsService.getPieChartData(userSession.userId, type)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch(err => {
                console.error('Erreur stats pie:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/stats/line =================
    if (path === '/api/stats/line' && method === 'GET') {
        StatsService.getLineChartData(userSession.userId)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch(err => {
                console.error('Erreur stats line:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/balance =================
    if (path === '/api/balance' && method === 'GET') {
        TransactionService.getBalance(userSession.userId)
            .then(balance => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ balance: parseFloat(balance).toFixed(2) }));
            })
            .catch(err => {
                console.error('Erreur balance:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= GET /api/home =================
    if (path === '/api/home' && method === 'GET') {
        // First get user info (fullName)
        db.query(
            'SELECT fullName FROM users WHERE id = ?',
            [userSession.userId],
            (err, userResults) => {
                if (err) {
                    console.error('Erreur获取用户信息:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Erreur serveur' }));
                    return;
                }

                const userFullName = userResults.length > 0 && userResults[0].fullName ? userResults[0].fullName : 'Utilisateur';

                Promise.all([
                    TransactionService.getBalance(userSession.userId),
                    TransactionService.getRecentTransactions(userSession.userId, 5)
                ])
                    .then(([balance, transactions]) => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            balance: parseFloat(balance).toFixed(2),
                            currency: '€',
                            rewards: 0,
                            username: userFullName,
                            lastTransactions: transactions.map(t => t.toJSON())
                        }));
                    })
                    .catch(err => {
                        console.error('Erreur home:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Erreur serveur' }));
                    });
            }
        );
        return;
    }

    // Route non trouvée
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
}

module.exports = handleStats;

