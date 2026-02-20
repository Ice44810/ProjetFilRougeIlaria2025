const usersController = require('../controllers/usersController');
const AuthService = require('../services/AuthService');

function handleUsers(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // ================= PROFILE =================
    if (path === '/api/users/profile') {
        if (method === 'GET') {
            usersController.getProfile(req, res, userSession);
        } else if (method === 'PUT') {
            // Utiliser le AuthService pour la mise à jour du profil
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const { parse } = require('querystring');
                const data = parse(body);
                
                const result = await AuthService.updateProfile(userSession.userId, data);
                
                res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
        }
        return;
    }

    // ================= CHANGE PASSWORD =================
    if (path === '/api/users/change-password') {
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const { parse } = require('querystring');
                const data = parse(body);
                
                const result = await AuthService.changePassword(userSession.userId, data.oldPassword, data.newPassword);
                
                res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
        }
        return;
    }

    // ================= RESET PASSWORD =================
    if (path === '/api/users/reset-password') {
        if (method === 'POST') {
            usersController.resetPassword(req, res);
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
        }
        return;
    }

    // ================= ADMIN: GET ALL USERS =================
    if (path === '/api/users' && method === 'GET') {
        // Vérifier si l'utilisateur est admin
        if (userSession.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Accès refusé' }));
            return;
        }

        const db = require('../utils/db');
        db.query('SELECT id, email, role, fullName, phone, created_at FROM users', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
        return;
    }

    // Route non trouvée
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
}

module.exports = handleUsers;
