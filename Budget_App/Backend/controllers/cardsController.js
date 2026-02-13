const db = require('../utils/db');

// Helper function to determine card brand
function getCardBrand(cardNumber) {
    if (/^4/.test(cardNumber)) {
        return 'Visa';
    }
    if (/^5[1-5]/.test(cardNumber)) {
        return 'Mastercard';
    }
    if (/^3[47]/.test(cardNumber)) {
        return 'American Express';
    }
    // Add more rules for other card types
    return 'Unknown';
}

exports.createCard = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        let data;
        try {
            data = JSON.parse(body);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Corps de la requête JSON invalide' }));
            return;
        }

        const { cardNumber, cardHolderName, expiryDate, cvv } = data;

        if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Tous les champs sont requis' }));
            return;
        }

        // --- Security: Basic validation and sanitization ---
        const last4Digits = cardNumber.replace(/[^0-9]/g, '').slice(-4);
        const brand = getCardBrand(cardNumber.replace(/[^0-9]/g, ''));

        if (last4Digits.length !== 4) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Numéro de carte invalide' }));
            return;
        }

        const newCard = {
            user_id: userSession.userId,
            card_holder_name: cardHolderName,
            last_4_digits: last4Digits,
            expiry_date: expiryDate, // Assuming format is MM/YYYY
            card_brand: brand
        };

        db.query('INSERT INTO cards SET ?', newCard, (err, result) => {
            if (err) {
                console.error('Error in createCard:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur lors de l\'ajout de la carte' }));
                return;
            }
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, ...newCard }));
        });
    });
};

exports.getCards = (req, res, userSession) => {
    db.query('SELECT id, card_holder_name, last_4_digits, expiry_date, card_brand FROM cards WHERE user_id = ?', [userSession.userId], (err, results) => {
        if (err) {
            console.error('Error in getCards:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    });
};

exports.deleteCard = (req, res, userSession) => {
    const urlParts = req.url.split('/');
    const cardId = urlParts[urlParts.length - 1];

    if (!/^\d+$/.test(cardId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'ID de carte invalide' }));
    }

    db.query('DELETE FROM cards WHERE id = ? AND user_id = ?', [cardId, userSession.userId], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        if (result.affectedRows === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Carte non trouvée ou non autorisée' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Carte supprimée avec succès' }));
    });
};
