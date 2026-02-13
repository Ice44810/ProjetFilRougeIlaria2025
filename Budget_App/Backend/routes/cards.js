const cardsController = require('../controllers/cardsController');

function handleCards(req, res, userSession) {
    const { method } = req;
    const url = req.url;

    if (url === '/api/cards' && method === 'GET') {
        cardsController.getCards(req, res, userSession);
    } else if (url === '/api/cards' && method === 'POST') {
        cardsController.createCard(req, res, userSession);
    } else if (url.startsWith('/api/cards/') && method === 'DELETE') {
        cardsController.deleteCard(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Méthode ${method} non autorisée sur ${url}` }));
    }
}

module.exports = handleCards;
