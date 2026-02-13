const recipientsController = require('../controllers/recipientsController');

function handleRecipients(req, res, userSession) {
    const { method } = req;
    const url = req.url;

    if (url.startsWith('/api/recipients/') && method === 'GET') {
        recipientsController.getRecipientById(req, res, userSession);
    } else if (url === '/api/recipients' && method === 'GET') {
        recipientsController.getRecipients(req, res, userSession);
    } else if (url === '/api/recipients' && method === 'POST') {
        recipientsController.createRecipient(req, res, userSession);
    } else if (url.startsWith('/api/recipients/') && method === 'DELETE') {
        recipientsController.deleteRecipient(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Méthode ${method} non autorisée sur ${url}` }));
    }
}

module.exports = handleRecipients;
