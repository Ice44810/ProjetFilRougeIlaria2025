const db = require('../utils/db');

//RÉCUPÉRER toutes les catégories de l'utilisateur
exports.getCategories = (req, res, userSession) => {
    db.query('SELECT * FROM categories WHERE user_id = ?', [userSession.userId], (err, results) => {
        if (err) {
            console.error('Erreur getCategories:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

//RÉCUPÉRER une catégorie par son ID
exports.getCategoryById = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const categoryId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(categoryId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de catégorie invalide' }));
    }

    db.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [categoryId, userSession.userId], (err, results) => {
        if (err) {
            console.error('Erreur getCategoryById:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        if (results.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Catégorie non trouvée ou non autorisée' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results[0]));
    });
};

// CRÉER une catégorie (Utilise JSON.parse pour la cohérence)
exports.createCategory = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { name } = JSON.parse(body); // Passage au format JSON
            if (!name || name.trim() === '') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Le nom de la catégorie est requis' }));
            }

            db.query('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name, userSession.userId], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur lors de la création' }));
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: result.insertId, name, user_id: userSession.userId }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON invalide' }));
        }
    });
};

// METTRE À JOUR une catégorie
exports.updateCategory = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const categoryId = urlParts[urlParts.length - 1];

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { name } = JSON.parse(body);
            db.query('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', [name, categoryId, userSession.userId], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                }
                if (result.affectedRows === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Catégorie non trouvée' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Catégorie mise à jour' }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON invalide' }));
        }
    });
};

// SUPPRIMER une catégorie (avec vérification de dépendances)
 
exports.deleteCategory = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const categoryId = urlParts[urlParts.length - 1];

    // ÉTAPE 1 : Vérifier si des transactions/dépenses utilisent cette catégorie
    // On suppose ici que tu as une table 'expenses' ou 'transactions'
    db.query('SELECT COUNT(*) AS count FROM transactions WHERE category_id = ?', [categoryId], (err, results) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur lors de la vérification' }));
        }

        if (results[0].count > 0) {
            // Interdiction de supprimer car la catégorie est utilisée
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
                message: `Impossible de supprimer : ${results[0].count} transaction(s) utilisent cette catégorie.` 
            }));
        }

        // ÉTAPE 2 : Si pas de dépendances, on supprime
        db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userSession.userId], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur lors de la suppression' }));
            }
            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Catégorie non trouvée ou non autorisée' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Catégorie supprimée avec succès' }));
        });
    });
};