/**
 * CardService - Service pour la gestion des cartes de paiement
 * Gère les opérations CRUD pour les cartes
 * Implémente les concepts POO
 */
const db = require('../utils/db');

class CardService {
    /**
     * Récupérer toutes les cartes d'un utilisateur
     * @param {number} userId 
     * @returns {Promise<Object[]>}
     */
    static getCards(userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT id, user_id, card_holder_name, last_4_digits, expiry_date, card_brand, created_at FROM cards WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);
                }
            );
        });
    }

    /**
     * Récupérer une carte par ID
     * @param {number} cardId 
     * @param {number} userId 
     * @returns {Promise<Object|null>}
     */
    static getCardById(cardId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT id, user_id, card_holder_name, last_4_digits, expiry_date, card_brand, created_at FROM cards WHERE id = ? AND user_id = ?',
                [cardId, userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results.length > 0 ? results[0] : null);
                }
            );
        });
    }

    /**
     * Créer une nouvelle carte
     * @param {number} userId 
     * @param {Object} data - Données de la carte
     * @returns {Promise<{success: boolean, card?: Object, error?: string}>}
     */
    static createCard(userId, data) {
        return new Promise((resolve, reject) => {
            const { cardNumber, cardHolderName, expiryDate } = data;

            if (!cardNumber || !cardHolderName || !expiryDate) {
                resolve({ success: false, error: 'Tous les champs sont requis' });
                return;
            }

            const cleanNumber = cardNumber.replace(/[^0-9]/g, '');
            const last4Digits = cleanNumber.slice(-4);
            const brand = CardService.getCardBrand(cleanNumber);

            // Vérifier si la carte existe déjà
            db.query(
                'SELECT id FROM cards WHERE user_id = ? AND last_4_digits = ? AND card_brand = ?',
                [userId, last4Digits, brand],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results.length > 0) {
                        resolve({ success: false, error: 'Cette carte est déjà enregistrée' });
                        return;
                    }

                    const newCard = {
                        user_id: userId,
                        card_holder_name: cardHolderName,
                        last_4_digits: last4Digits,
                        expiry_date: expiryDate,
                        card_brand: brand
                    };

                    db.query('INSERT INTO cards SET ?', newCard, (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            success: true,
                            card: { id: result.insertId, ...newCard }
                        });
                    });
                }
            );
        });
    }

    /**
     * Mettre à jour une carte
     * @param {number} cardId 
     * @param {number} userId 
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static updateCard(cardId, userId, data) {
        return new Promise((resolve, reject) => {
            const { cardHolderName, expiryDate } = data;

            if (!cardHolderName || !expiryDate) {
                resolve({ success: false, error: 'Le nom du titulaire et la date d\'expiration sont requis' });
                return;
            }

            db.query(
                'UPDATE cards SET card_holder_name = ?, expiry_date = ? WHERE id = ? AND user_id = ?',
                [cardHolderName, expiryDate, cardId, userId],
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Carte non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Supprimer une carte
     * @param {number} cardId 
     * @param {number} userId 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static deleteCard(cardId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM cards WHERE id = ? AND user_id = ?',
                [cardId, userId],
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Carte non trouvée' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Détecter la marque de la carte
     * @param {string} cardNumber 
     * @returns {string}
     */
    static getCardBrand(cardNumber) {
        const cleanNumber = cardNumber.replace(/[^0-9]/g, '');
        if (/^4/.test(cleanNumber)) return 'Visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'American Express';
        return 'Unknown';
    }

    /**
     * Valider le numéro de carte avec l'algorithme de Luhn
     * @param {string} number 
     * @returns {boolean}
     */
    static isValidLuhn(number) {
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
}

module.exports = CardService;
