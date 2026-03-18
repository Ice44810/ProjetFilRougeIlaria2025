const logger = require('../utils/logger');
const db = require('../utils/db');
const { StatsService } = require('./stats'); // Reuse balance

/**
 * Handler for transfers/payments
 */
async function handleTransfers(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    try {
        // POST /api/transfers/p2p
        if (path === '/api/transfers/p2p' && method === 'POST') {
            const { recipient_id, amount, title = 'Transfer P2P' } = req.body;
            const amt = parseFloat(amount);
            if (!recipient_id || isNaN(amt) || amt <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
            }

            // Check balance
            const balance = await StatsService.getBalance(userSession.userId);
            if (parseFloat(balance) < amt) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Insufficient balance' }));
            }

            // Get recipient
            const [recipient] = await db.queryPromise('SELECT * FROM recipients WHERE id = ? AND user_id = ?', [recipient_id, userSession.userId]);
            if (!recipient) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Recipient not found' }));
            }

            // Mock receiverUserId - in full app, lookup by phone/email from users
            const receiverUserId = null; // or lookup

            // Create expense for sender
            await db.queryPromise('INSERT INTO transactions (user_id, title, amount, type) VALUES (?, ?, ?, "expense")', [userSession.userId, title, amt]);

            // Create income for receiver if user
            if (receiverUserId) {
                await db.queryPromise('INSERT INTO transactions (user_id, title, amount, type) VALUES (?, ?, ?, "income")', [receiverUserId, `Transfer from ${userSession.email}`, amt]);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Transfer completed' }));
            return;
        }

        // POST /api/transfers/confirm/:id
        const confirmMatch = path.match(/^\/api\/transfers\/confirm\/(\d+)$/);
        if (confirmMatch && method === 'POST') {
            // Mark pending transfer as confirmed, execute above
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Confirmed' }));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
    } catch (err) {
        logger.error('Transfers handler error', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Erreur serveur' }));
    }
}

module.exports = handleTransfers;
