const db = require('../utils/db');

// Fonctions utilitaires (placées à l'extérieur pour la clarté)
function getCardBrand(cardNumber) {
    const cleanNumber = cardNumber.replace(/[^0-9]/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    return 'Unknown';
}

// L'algorithme de Luhn permet de détecter les erreurs de frappe.
function isValidLuhn(number) {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    let sum = 0;
    for (let i = 0; i < cleanNumber.length; i++) {
        let intVal = parseInt(cleanNumber.substr(i, 1));
        if (i % 2 === (cleanNumber.length % 2)) {
            intVal *= 2;
            if (intVal > 9) intVal -= 9;
        }
        sum += intVal;
    }
    return (sum % 10) === 0 && cleanNumber.length > 0;
}

// ================= GET ALL CARDS =================
exports.getCards = (req, res, userSession) => {
    db.query(
        'SELECT id, user_id, card_holder_name, last_4_digits, expiry_date, card_brand, created_at FROM cards WHERE user_id = ?',
        [userSession.userId],
        (err, results) => {
            if (err) {
                console.error('Error in getCards:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur serveur' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }
    );
};

// ================= GET CARD BY ID =================
exports.getCardById = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const cardId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(cardId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de carte invalide' }));
    }

    db.query(
        'SELECT id, user_id, card_holder_name, last_4_digits, expiry_date, card_brand, created_at FROM cards WHERE id = ? AND user_id = ?',
        [cardId, userSession.userId],
        (err, results) => {
            if (err) {
                console.error('Error in getCardById:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur serveur' }));
            }
            if (results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Carte non trouvée ou non autorisée' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
        }
    );
};

// ================= CREATE CARD =================
exports.createCard = (req, res, userSession) => {
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

        const { cardNumber, cardHolderName, expiryDate, cvv } = data;

        // Validation des champs présents
        if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Tous les champs sont requis' }));
        }

        const cleanNumber = cardNumber.replace(/[^0-9]/g, '');

        // Validation Algorithme de Luhn
        if (!isValidLuhn(cleanNumber)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Numéro de carte mathématiquement invalide' }));
        }

        const last4Digits = cleanNumber.slice(-4);
        const brand = getCardBrand(cleanNumber);

        const newCard = {
            user_id: userSession.userId,
            card_holder_name: cardHolderName,
            last_4_digits: last4Digits,
            expiry_date: expiryDate,
            card_brand: brand
        };

        // ÉTAPE 1 : Vérifier si la carte existe déjà pour cet utilisateur
        db.query(
            'SELECT id FROM cards WHERE user_id = ? AND last_4_digits = ? AND card_brand = ?',
            [userSession.userId, last4Digits, brand],
            (err, results) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur lors de la vérification' }));
                }

                if (results.length > 0) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Cette carte est déjà enregistrée' }));
                }

                // ÉTAPE 2 : L'insertion se fait SEULEMENT si la vérification est passée
                db.query('INSERT INTO cards SET ?', newCard, (err, result) => {
                    if (err) {
                        console.error('Error in createCard:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Erreur lors de l\'ajout de la carte' }));
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ id: result.insertId, ...newCard }));
                });
            }
        );
    });
};

// ================= UPDATE CARD =================
exports.updateCard = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const cardId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(cardId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de carte invalide' }));
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

        const { cardHolderName, expiryDate } = data;

        // Validation des champs présents
        if (!cardHolderName || !expiryDate) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Le nom du titulaire et la date d\'expiration sont requis' }));
        }

        db.query(
            'UPDATE cards SET card_holder_name = ?, expiry_date = ? WHERE id = ? AND user_id = ?',
            [cardHolderName, expiryDate, cardId, userSession.userId],
            (err, result) => {
                if (err) {
                    console.error('Error in updateCard:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur lors de la mise à jour' }));
                }
                if (result.affectedRows === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Carte non trouvée ou non autorisée' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Carte mise à jour avec succès' }));
            }
        );
    });
};

// ================= DELETE CARD =================
exports.deleteCard = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const cardId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(cardId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de carte invalide' }));
    }

    db.query(
        'DELETE FROM cards WHERE id = ? AND user_id = ?',
        [cardId, userSession.userId],
        (err, result) => {
            if (err) {
                console.error('Error in deleteCard:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur serveur' }));
            }
            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Carte non trouvée' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Carte supprimée avec succès' }));
        }
    );
};
