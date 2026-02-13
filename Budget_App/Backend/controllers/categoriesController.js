const db = require('../utils/db');
const { parse } = require('querystring');

exports.getCategories = (req, res, userSession) => {
    db.query('SELECT * FROM categories WHERE user_id = ?', [userSession.userId], (err, results) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

exports.createCategory = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { name } = parse(body);
        if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Nom requis' }));
            return;
        }
        db.query('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name, userSession.userId], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, name, user_id: userSession.userId }));
        });
    });
};

exports.updateCategory = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const categoryId = urlParts[urlParts.length - 1];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { name } = parse(body);
        if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Nom requis' }));
            return;
        }
        db.query('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', [name, categoryId, userSession.userId], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Catégorie non trouvée' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Catégorie mise à jour' }));
        });
    });
};

exports.deleteCategory = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const categoryId = urlParts[urlParts.length - 1];
    db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Catégorie non trouvée' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Catégorie supprimée' }));
    });
};
