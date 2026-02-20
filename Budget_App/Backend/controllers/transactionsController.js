const db = require('../utils/db');


 // RÉCUPÉRER les transactions avec filtres
 // Gère le filtrage par catégorie et par période (mois/année)
exports.getTransactions = (req, res, userSession) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const categoryId = url.searchParams.get('category_id');
    const period = url.searchParams.get('period'); 

    // Jointure (LEFT JOIN) pour récupérer le nom de la catégorie en même temps que la transaction
    let query = `
        SELECT t.*, c.name as category_name 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = ?`;
    
    let params = [userSession.userId];

    // Filtre par catégorie
    if (categoryId) {
        query += ' AND t.category_id = ?';
        params.push(categoryId);
    }

    // Filtre temporel dynamique
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
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

// CRÉER une transaction

exports.createTransaction = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { title, amount, type, category_id } = JSON.parse(body);

            // Validation stricte des données entrantes
            if (!title || amount === undefined || !type) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Titre, montant et type requis' }));
            }

            // Vérification que le montant est un nombre positif
            if (isNaN(amount) || amount <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Le montant doit être un nombre positif' }));
            }

            if (type !== 'income' && type !== 'expense') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Le type doit être "income" ou "expense"' }));
            }

            const query = 'INSERT INTO transactions (user_id, title, amount, type, category_id) VALUES (?, ?, ?, ?, ?)';
            const params = [userSession.userId, title.trim(), amount, type, category_id || null];

            db.query(query, params, (err, result) => {
                if (err) {
                    console.error('Error in createTransaction:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: result.insertId, user_id: userSession.userId, title, amount, type, category_id }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON invalide' }));
        }
    });
};

// METTRE À JOUR une transaction
 
exports.updateTransaction = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const transactionId = urlParts[urlParts.length - 1];
    
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { title, amount, type, category_id } = JSON.parse(body);

            // Sécurité : on vérifie l'existence et l'appartenance avant mise à jour
            const query = 'UPDATE transactions SET title = ?, amount = ?, type = ?, category_id = ? WHERE id = ? AND user_id = ?';
            const params = [title, amount, type, category_id || null, transactionId, userSession.userId];

            db.query(query, params, (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                }
                if (result.affectedRows === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Transaction non trouvée ou non autorisée' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Transaction mise à jour' }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON invalide' }));
        }
    });
};

// SUPPRIMER une transaction
exports.deleteTransaction = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const transactionId = urlParts[urlParts.length - 1];

    db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Transaction non trouvée' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Transaction supprimée' }));
    });
};