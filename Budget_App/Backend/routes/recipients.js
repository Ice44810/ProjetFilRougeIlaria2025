const recipientsController = require('../controllers/recipientsController');

function handleRecipients(req, res, userSession) {
    const { method } = req;
    const url = req.url;

    // GET /api/recipients/:id - Get single recipient
    if (url.match(/^\/api\/recipients\/\d+$/) && method === 'GET') {
        recipientsController.getRecipientById(req, res, userSession);
    }
    // GET /api/recipients - Get all recipients
    else if (url === '/api/recipients' && method === 'GET') {
        recipientsController.getRecipients(req, res, userSession);
    }
    // POST /api/recipients - Create new recipient
    else if (url === '/api/recipients' && method === 'POST') {
        recipientsController.createRecipient(req, res, userSession);
    }
    // PUT /api/recipients/:id - Update recipient
    else if (url.match(/^\/api\/recipients\/\d+$/) && method === 'PUT') {
        recipientsController.updateRecipient(req, res, userSession);
    }
    // DELETE /api/recipients/:id - Delete recipient
    else if (url.match(/^\/api\/recipients\/\d+$/) && method === 'DELETE') {
        recipientsController.deleteRecipient(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Méthode ${method} non autorisée sur ${url}` }));
    }
}

module.exports = handleRecipients;
