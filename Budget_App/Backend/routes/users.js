const usersController = require('../controllers/usersController');

function handleUsers(req, res, userSession) {
    const urlParts = req.url.split('/');
    const endpoint = urlParts[2]; // e.g., 'profile' or 'reset-password'

    if (endpoint === 'profile') {
        if (req.method === 'GET') {
            usersController.getProfile(req, res, userSession);
        } else if (req.method === 'PUT') {
            usersController.updateProfile(req, res, userSession);
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
        }
    } else if (endpoint === 'reset-password') {
        if (req.method === 'POST') {
            usersController.resetPassword(req, res);
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
    }
}

module.exports = handleUsers;
