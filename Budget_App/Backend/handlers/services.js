const logger = require('../utils/logger');
const db = require('../utils/db');

/**
 * Handler for services/bills
 */
async function handleServices(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    try {
        // GET /api/services
        if (path === '/api/services' && method === 'GET') {
            // Mock services
            const services = [
                { id: 1, name: 'Mobile', icon: 'phone', providers: ['Orange', 'Free'] },
                { id: 2, name: 'Internet', icon: 'wifi', providers: ['Free', 'SFR'] },
                { id: 3, name: 'Électricité', icon: 'lightning', providers: ['EDF'] },
                { id: 4, name: 'Eau', icon: 'droplet', providers: ['Veolia'] },
                { id: 5, name: 'Film', icon: 'film', providers: ['Netflix', 'Disney+'] }
            ];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(services));
            return;
        }

        // POST /api/services/pay/:serviceId
        const payMatch = path.match(/^\/api\/services\/pay\/(\d+)$/);
        if (payMatch && method === 'POST') {
            const serviceId = parseInt(payMatch[1]);
            const { amount, provider } = req.body;
            // Create transaction expense
            await db.queryPromise('INSERT INTO transactions (user_id, title, amount, type, category_id) VALUES (?, ?, ?, "expense", 5)', [userSession.userId, `Pay ${provider} Service ${serviceId}`, parseFloat(amount)]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Bill paid' }));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
    } catch (err) {
        logger.error('Services handler error', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Erreur serveur' }));
    }
}

module.exports = handleServices;

