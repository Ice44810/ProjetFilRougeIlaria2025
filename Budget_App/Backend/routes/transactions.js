/**
 * Transactions Router - Gestion des routes de transactions
 */
const TransactionService = require('../services/TransactionService');

function handleTransactions(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // ================= GET /api/transactions =================
    if (path === '/api/transactions' && method === 'GET') {
        const filters = {
            categoryId: url.searchParams.get('category_id'),
            type: url.searchParams.get('type'),
            period: url.searchParams.get('period')
        };

        TransactionService.getTransactions(userSession.userId, filters)
            .then(transactions => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(transactions.map(t => t.toJSON())));
            })
            .catch(err => {
                console.error('Erreur getTransactions:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= POST /api/transactions =================
    if (path === '/api/transactions' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { parse } = require('querystring');
            const data = parse(body);

            const result = await TransactionService.createTransaction(userSession.userId, data);

            if (result.success) {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.transaction));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: result.error }));
            }
        });
        return;
    }

    // ================= GET /api/transactions/:id =================
    const transactionIdMatch = path.match(/^\/api\/transactions\/(\d+)$/);
    if (transactionIdMatch && method === 'GET') {
        const transactionId = parseInt(transactionIdMatch[1]);

        TransactionService.getTransactionById(transactionId, userSession.userId)
            .then(transaction => {
                if (!transaction) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Transaction non trouvée' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(transaction.toJSON()));
            })
            .catch(err => {
                console.error('Erreur getTransaction:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // ================= PUT /api/transactions/:id =================
    if (transactionIdMatch && method === 'PUT') {
        const transactionId = parseInt(transactionIdMatch[1]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { parse } = require('querystring');
            const data = parse(body);

            const result = await TransactionService.updateTransaction(transactionId, userSession.userId, data);

            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Transaction mise à jour' }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: result.error }));
            }
        });
        return;
    }

    // ================= DELETE /api/transactions/:id =================
    if (transactionIdMatch && method === 'DELETE') {
        const transactionId = parseInt(transactionIdMatch[1]);

        TransactionService.deleteTransaction(transactionId, userSession.userId)
            .then(result => {
                if (result.success) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Transaction supprimée' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.error }));
                }
            })
            .catch(err => {
                console.error('Erreur deleteTransaction:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
            });
        return;
    }

    // Route non trouvée
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
}

module.exports = handleTransactions;

