const db = require('../utils/db');

 // CRÉER un bénéficiaire
 // Ajout : Nettoyage de l'identifiant et vérification de doublon
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

        // 1. Validation de présence
        if (!name || !identifier || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Nom, identifiant et type sont requis' }));
        }

        // 2. Validation du type
        if (type !== 'phone' && type !== 'bank') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Le type doit être "phone" ou "bank"' }));
        }

        // 3. Nettoyage de l'identifiant (enlève espaces/tirets pour IBAN ou Téléphone)
        const cleanIdentifier = identifier.replace(/[\s-]/g, '').toUpperCase();

        // 4. ÉTAPE DE SÉCURITÉ : Vérifier si ce bénéficiaire existe déjà pour cet utilisateur
        db.query(
            'SELECT id FROM recipients WHERE user_id = ? AND identifier = ?',
            [userSession.userId, cleanIdentifier],
            (err, results) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur lors de la vérification' }));
                }

                if (results.length > 0) {
                    res.writeHead(409, { 'Content-Type': 'application/json' }); // 409 = Conflict
                    return res.end(JSON.stringify({ message: 'Ce bénéficiaire existe déjà' }));
                }

                const newRecipient = {
                    user_id: userSession.userId,
                    name: name.trim(),
                    identifier: cleanIdentifier,
                    type
                };

                // 5. Insertion après validation
                db.query('INSERT INTO recipients SET ?', newRecipient, (err, result) => {
                    if (err) {
                        console.error('Error in createRecipient:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Erreur lors de l\'ajout du bénéficiaire' }));
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ id: result.insertId, ...newRecipient }));
                });
            }
        );
    });
};

// RÉCUPÉRER tous les bénéficiaires de l'utilisateur
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

// RÉCUPÉRER un bénéficiaire spécifique par son ID
exports.getRecipientById = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const recipientId = urlParts[urlParts.length - 1];

    // Sécurité : Vérifie que l'ID est bien un nombre
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

// SUPPRIMER un bénéficiaire
exports.deleteRecipient = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const recipientId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(recipientId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de bénéficiaire invalide' }));
    }

    // Avant de supprimer, on pourrait aussi vérifier si des virements sont en cours pour ce bénéficiaire
    db.query('DELETE FROM recipients WHERE id = ? AND user_id = ?', [recipientId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Erreur serveur' }));
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Bénéficiaire non trouvé' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bénéficiaire supprimé avec succès' }));
    });
};

// ================= UPDATE RECIPIENT =================
exports.updateRecipient = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const recipientId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(recipientId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de bénéficiaire invalide' }));
    }

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

        // 1. Validation de présence
        if (!name || !identifier || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Nom, identifiant et type sont requis' }));
        }

        // 2. Validation du type
        if (type !== 'phone' && type !== 'bank') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Le type doit être "phone" ou "bank"' }));
        }

        // 3. Nettoyage de l'identifiant
        const cleanIdentifier = identifier.replace(/[\s-]/g, '').toUpperCase();

        // 4. Mise à jour du bénéficiaire
        db.query(
            'UPDATE recipients SET name = ?, identifier = ?, type = ? WHERE id = ? AND user_id = ?',
            [name.trim(), cleanIdentifier, type, recipientId, userSession.userId],
            (err, result) => {
                if (err) {
                    console.error('Error in updateRecipient:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur lors de la mise à jour' }));
                }
                if (result.affectedRows === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Bénéficiaire non trouvé ou non autorisé' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Bénéficiaire mis à jour avec succès' }));
            }
        );
    });
};
