/**
 * AuthService - Service d'authentification
 * Gère l'inscription, la connexion, la déconnexion et la récupération de mot de passe
 * Implémente les concepts POO avec des méthodes de classe
 */
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../utils/db');
const User = require('../models/User');

class AuthService {
    // Stockage temporaire des tokens de réinitialisation (en production, utiliser Redis ou la DB)
    static resetTokens = new Map();

    /**
     * Inscription d'un nouvel utilisateur
     * @param {string} email 
     * @param {string} password 
     * @param {string} role - Optionnel, par défaut 'user'
     * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
     */
    static async register(email, password, role = 'user') {
        try {
            // Vérifier si l'email existe déjà
            const existingUser = await this.findByEmail(email);
            if (existingUser) {
                return { success: false, error: 'Email déjà utilisé' };
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Créer l'utilisateur
            return new Promise((resolve, reject) => {
                db.query(
                    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                    [email, hashedPassword, role],
                    (err, result) => {
                        if (err) {
                            console.error('Erreur inscription:', err);
                            reject({ success: false, error: 'Erreur serveur' });
                            return;
                        }

                        resolve({
                            success: true,
                            user: {
                                id: result.insertId,
                                email,
                                role
                            }
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Erreur register:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Connexion d'un utilisateur
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
     */
    static async login(email, password) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                return { success: false, error: 'Identifiants invalides' };
            }

            // Vérifier le mot de passe
            const match = await bcrypt.compare(password, user.password);
            
            if (!match) {
                return { success: false, error: 'Identifiants invalides' };
            }

            // Retourner l'utilisateur sans le mot de passe
            const userModel = User.fromRow(user);
            return {
                success: true,
                user: userModel.toPublic()
            };
        } catch (error) {
            console.error('Erreur login:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Trouver un utilisateur par email
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    /**
     * Trouver un utilisateur par ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    /**
     * Mettre à jour le profil utilisateur
     * @param {number} userId 
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static async updateProfile(userId, data) {
        try {
            const { email, fullName, phone, address, postcode, ville, avatar } = data;
            
            if (!email) {
                return { success: false, error: 'Email requis' };
            }

            // Construire la requête dynamiquement selon les champs présents
            const fields = [];
            const values = [];
            
            if (email !== undefined) {
                fields.push('email = ?');
                values.push(email);
            }
            if (fullName !== undefined) {
                fields.push('fullName = ?');
                values.push(fullName);
            }
            if (phone !== undefined) {
                fields.push('phone = ?');
                values.push(phone);
            }
            if (address !== undefined) {
                fields.push('address = ?');
                values.push(address);
            }
            if (postcode !== undefined) {
                fields.push('postcode = ?');
                values.push(postcode);
            }
            if (ville !== undefined) {
                fields.push('ville = ?');
                values.push(ville);
            }
            if (avatar !== undefined) {
                fields.push('avatar = ?');
                values.push(avatar);
            }

            if (fields.length === 0) {
                return { success: false, error: 'Aucune donnée à mettre à jour' };
            }

            values.push(userId);

            return new Promise((resolve, reject) => {
                db.query(
                    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    (err, result) => {
                        if (err) {
                            console.error('Erreur mise à jour profil:', err);
                            reject({ success: false, error: 'Erreur serveur' });
                            return;
                        }
                        resolve({ success: true });
                    }
                );
            });
        } catch (error) {
            console.error('Erreur updateProfile:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Changer le mot de passe
     * @param {number} userId 
     * @param {string} oldPassword 
     * @param {string} newPassword 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await this.findById(userId);
            
            if (!user) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }

            // Vérifier l'ancien mot de passe
            const match = await bcrypt.compare(oldPassword, user.password);
            
            if (!match) {
                return { success: false, error: 'Ancien mot de passe incorrect' };
            }

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            return new Promise((resolve, reject) => {
                db.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, userId],
                    (err, result) => {
                        if (err) {
                            reject({ success: false, error: 'Erreur serveur' });
                            return;
                        }
                        resolve({ success: true });
                    }
                );
            });
        } catch (error) {
            console.error('Erreur changePassword:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Demander la réinitialisation du mot de passe
     * @param {string} email 
     * @returns {Promise<{success: boolean, token?: string, error?: string}>}
     */
    static async requestPasswordReset(email) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                // Pour des raisons de sécurité, ne pas révéler si l'email existe
                return { success: true, message: 'Si l\'email existe, un lien de réinitialisation sera envoyé' };
            }

            // Générer un token unique
            const token = crypto.randomBytes(32).toString('hex');
            const expires = Date.now() + 3600000; // 1 heure

            // Stocker le token (en production, utiliser une table dédiée)
            this.resetTokens.set(token, {
                userId: user.id,
                expires
            });

            // Log pour le développement (en production, envoyer par email)
            console.log(`Token de réinitialisation pour ${email}: ${token}`);
            
            return {
                success: true,
                token, // En production, ne pas retourner le token
                message: 'Lien de réinitialisation envoyé (voir console pour le token en développement)'
            };
        } catch (error) {
            console.error('Erreur requestPasswordReset:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Réinitialiser le mot de passe avec le token
     * @param {string} token 
     * @param {string} newPassword 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    static async resetPassword(token, newPassword) {
        try {
            const tokenData = this.resetTokens.get(token);
            
            if (!tokenData) {
                return { success: false, error: 'Token invalide' };
            }

            if (Date.now() > tokenData.expires) {
                this.resetTokens.delete(token);
                return { success: false, error: 'Token expiré' };
            }

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            return new Promise((resolve, reject) => {
                db.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, tokenData.userId],
                    (err, result) => {
                        if (err) {
                            reject({ success: false, error: 'Erreur serveur' });
                            return;
                        }
                        
                        // Supprimer le token après utilisation
                        this.resetTokens.delete(token);
                        
                        resolve({ success: true });
                    }
                );
            });
        } catch (error) {
            console.error('Erreur resetPassword:', error);
            return { success: false, error: 'Erreur serveur' };
        }
    }

    /**
     * Vérifier les permissions basées sur le rôle
     * @param {string} userRole 
     * @param {string} requiredRole 
     * @returns {boolean}
     */
    static hasPermission(userRole, requiredRole) {
        const roleHierarchy = {
            'admin': 3,
            'user': 1
        };

        return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    }
}

module.exports = AuthService;

