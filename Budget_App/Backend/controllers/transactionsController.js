const db = require('../utils/db');
const { parse } = require('querystring');

exports.getTransactions = (req, res, userSession) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const categoryId = url.searchParams.get('category_id');
    const period = url.searchParams.get('period'); // e.g., 'month', 'year'

    let query = 'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ?';
    let params = [userSession.userId];

    if (categoryId) {
        query += ' AND t.category_id = ?';
        params.push(categoryId);
    }

    if (period) {
        if (period === 'month') {
            query += ' AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())';
        } else if (period === 'year') {
            query += ' AND YEAR(t.created_at) = YEAR(CURDATE())';
        }
    }

    query += ' ORDER BY t.created_at DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error in getTransactions:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

exports.createTransaction = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { title, amount, type, category_id } = parse(body);
        if (!title || !amount || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Titre, montant et type requis' }));
            return;
        }
        if (type !== 'income' && type !== 'expense') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Type doit être income ou expense' }));
            return;
        }
        db.query('INSERT INTO transactions (user_id, title, amount, type, category_id) VALUES (?, ?, ?, ?, ?)',
            [userSession.userId, title, amount, type, category_id || null], (err, result) => {
            if (err) {
                console.error('Error in createTransaction:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, user_id: userSession.userId, title, amount, type, category_id }));
        });
    });
};

exports.updateTransaction = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const transactionId = urlParts[urlParts.length - 1];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { title, amount, type, category_id } = parse(body);
        if (!title || !amount || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Titre, montant et type requis' }));
            return;
        }
        if (type !== 'income' && type !== 'expense') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Type doit être income ou expense' }));
            return;
        }
        db.query('UPDATE transactions SET title = ?, amount = ?, type = ?, category_id = ? WHERE id = ? AND user_id = ?',
            [title, amount, type, category_id || null, transactionId, userSession.userId], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Transaction non trouvée' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Transaction mise à jour' }));
        });
    });
};

exports.deleteTransaction = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const transactionId = urlParts[urlParts.length - 1];
    db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Transaction non trouvée' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Transaction supprimée' }));
    });
};
