const db = require('../utils/db');

exports.createRecipient = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        let data;
        try {
            data = JSON.parse(body);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Corps de la requête JSON invalide' }));
        }

        const { name, identifier, type } = data;

        if (!name || !identifier || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Nom, identifiant et type sont requis' }));
        }

        if (type !== 'phone' && type !== 'bank') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Le type doit être "phone" ou "bank"' }));
        }

        const newRecipient = {
            user_id: userSession.userId,
            name,
            identifier,
            type
        };

        db.query('INSERT INTO recipients SET ?', newRecipient, (err, result) => {
            if (err) {
                console.error('Error in createRecipient:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur lors de la création du bénéficiaire' }));
            }
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, ...newRecipient }));
        });
    });
};

exports.getRecipients = (req, res, userSession) => {
    db.query('SELECT id, name, identifier, type FROM recipients WHERE user_id = ?', [userSession.userId], (err, results) => {
        if (err) {
            console.error('Error in getRecipients:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

exports.getRecipientById = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const recipientId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(recipientId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de bénéficiaire invalide' }));
    }

    db.query('SELECT id, name, identifier, type FROM recipients WHERE id = ? AND user_id = ?', [recipientId, userSession.userId], (err, results) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        if (results.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Bénéficiaire non trouvé ou non autorisé' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results[0]));
    });
};

exports.deleteRecipient = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const recipientId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(recipientId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de bénéficiaire invalide' }));
    }

    db.query('DELETE FROM recipients WHERE id = ? AND user_id = ?', [recipientId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Bénéficiaire non trouvé ou non autorisé' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bénéficiaire supprimé avec succès' }));
    });
};
