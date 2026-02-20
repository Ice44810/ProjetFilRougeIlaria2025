const cardsController = require('../controllers/cardsController');

function handleCards(req, res, userSession) {
    const { method } = req;
    const url = req.url;

    // GET /api/cards/:id - Get single card
    if (url.match(/^\/api\/cards\/\d+$/) && method === 'GET') {
        cardsController.getCardById(req, res, userSession);
    }
    // GET /api/cards - Get all cards
    else if (url === '/api/cards' && method === 'GET') {
        cardsController.getCards(req, res, userSession);
    }
    // POST /api/cards - Create new card
    else if (url === '/api/cards' && method === 'POST') {
        cardsController.createCard(req, res, userSession);
    }
    // PUT /api/cards/:id - Update card
    else if (url.match(/^\/api\/cards\/\d+$/) && method === 'PUT') {
        cardsController.updateCard(req, res, userSession);
    }
    // DELETE /api/cards/:id - Delete card
    else if (url.match(/^\/api\/cards\/\d+$/) && method === 'DELETE') {
        cardsController.deleteCard(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Méthode ${method} non autorisée sur ${url}` }));
    }
}

module.exports = handleCards;
