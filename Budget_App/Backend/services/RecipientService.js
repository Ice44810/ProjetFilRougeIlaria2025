/**
 * RecipientService - Service pour la gestion des bénéficiaires
 * Gère les opérations CRUD pour les bénéficiaires
 * Implémente les concepts POO
 */
const db = require('../utils/db');

class RecipientService {
    /**
     * Récupérer tous les bénéficiaires d'un utilisateur
     * @param {number} userId 
     * @returns {Promise<Object[]>}
     */
    static getRecipients(userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT id, name, identifier, type, created_at FROM recipients WHERE user_id = ? ORDER BY name ASC',
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
     * Récupérer un bénéficiaire par ID
     * @param {number} recipientId 
     * @param {number} userId 
     * @returns {Promise<Object|null>}
     */
    static getRecipientById(recipientId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT id, name, identifier, type, created_at FROM recipients WHERE id = ? AND user_id = ?',
                [recipientId, userId],
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
     * Créer un nouveau bénéficiaire
     * @param {number} userId 
     * @param {Object} data - Données du bénéficiaire
     * @returns {Promise<{success: boolean, recipient?: Object, error?: string}>}
     */
    static createRecipient(userId, data) {
        return new Promise((resolve, reject) => {
            const { name, identifier, type } = data;

            if (!name || !identifier || !type) {
                resolve({ success: false, error: 'Nom, identifiant et type sont requis' });
                return;
            }

            if (type !== 'phone' && type !== 'bank') {
                resolve({ success: false, error: 'Le type doit être "phone" ou "bank"' });
                return;
            }

            const cleanIdentifier = identifier.replace(/[\s-]/g, '').toUpperCase();

            // Vérifier si le bénéficiaire existe déjà
            db.query(
                'SELECT id FROM recipients WHERE user_id = ? AND identifier = ?',
                [userId, cleanIdentifier],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results.length > 0) {
                        resolve({ success: false, error: 'Ce bénéficiaire existe déjà' });
                        return;
                    }

                    const newRecipient = {
                        user_id: userId,
                        name: name.trim(),
                        identifier: cleanIdentifier,
                        type
                    };

                    db.query('INSERT INTO recipients SET ?', newRecipient, (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            success: true,
                            recipient: { id: result.insertId, ...newRecipient }
                        });
                    });
                }
            );
        });
    }

    /**
     * Mettre à jour un bénéficiaire
     * @param {number} recipientId 
     * @param {number} userId 
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static updateRecipient(recipientId, userId, data) {
        return new Promise((resolve, reject) => {
            const { name, identifier, type } = data;

            if (!name || !identifier || !type) {
                resolve({ success: false, error: 'Nom, identifiant et type sont requis' });
                return;
            }

            if (type !== 'phone' && type !== 'bank') {
                resolve({ success: false, error: 'Le type doit être "phone" ou "bank"' });
                return;
            }

            const cleanIdentifier = identifier.replace(/[\s-]/g, '').toUpperCase();

            db.query(
                'UPDATE recipients SET name = ?, identifier = ?, type = ? WHERE id = ? AND user_id = ?',
                [name.trim(), cleanIdentifier, type, recipientId, userId],
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Bénéficiaire non trouvé' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Supprimer un bénéficiaire
     * @param {number} recipientId 
     * @param {number} userId 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static deleteRecipient(recipientId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM recipients WHERE id = ? AND user_id = ?',
                [recipientId, userId],
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (result.affectedRows === 0) {
                        resolve({ success: false, error: 'Bénéficiaire non trouvé' });
                        return;
                    }

                    resolve({ success: true });
                }
            );
        });
    }

    /**
     * Rechercher des bénéficiaires par nom
     * @param {number} userId 
     * @param {string} searchTerm 
     * @returns {Promise<Object[]>}
     */
    static searchRecipients(userId, searchTerm) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, name, identifier, type, created_at 
                FROM recipients 
                WHERE user_id = ? AND name LIKE ?
                ORDER BY name ASC
            `;
            
            db.query(query, [userId, `%${searchTerm}%`], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }
}

module.exports = RecipientService;
