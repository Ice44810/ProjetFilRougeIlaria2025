const db = require('../utils/db');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const logger = require('../utils/logger');

const resetTokens = new Map();
const otps = new Map();

/**
 * Handler consolidé pour /api/users
 * Merge routes/users.js + controllers/usersController.js + services/AuthService.js
 */
async function handleUsers(req, res, userSession) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    try {
        // GET /api/users/profile
        if (path === '/api/users/profile' && req.method === 'GET') {
            const user = await getProfile(userSession.userId);
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Utilisateur non trouvé' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
            return;
        }

        // PUT /api/users/profile
        if (path === '/api/users/profile' && req.method === 'PUT') {
            const result = await updateProfile(userSession.userId, req.body);
            res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }

        // POST /api/users/change-password
        if (path === '/api/users/change-password' && req.method === 'POST') {
            const result = await changePasswordWithOTP(userSession.userId, req.body.oldPassword, req.body.newPassword, req.body.otp);
            res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }

// POST /api/users/reset-password
        if (path === '/api/users/reset-password' && req.method === 'POST') {
            const result = await requestPasswordReset(req.body.email);
            res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }

        // POST /api/users/reset-password-confirm
        if (path === '/api/users/reset-password-confirm' && req.method === 'POST') {
            const stored = resetTokens.get(req.body.token);
            if (!stored || stored.expires < Date.now()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Token invalid/expired' }));
            }
            const hashed = await bcrypt.hash(req.body.newPassword, 12);
            await new Promise(r => db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, stored.userId], r));
            resetTokens.delete(req.body.token);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // POST /api/users/otp-generate
        if (path === '/api/users/otp-generate' && req.method === 'POST') {
            const code = crypto.randomInt(100000, 999999).toString();
            const hash = await bcrypt.hash(code, 12);
            otps.set(userSession.userId, { hash, expires: Date.now() + 5 * 60 * 1000 });
            logger.info(`OTP generated for user ${userSession.userId}`, { email: userSession.email }); // Send SMS/Email in prod
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'OTP generated (console)' }));
            return;
        }

        // POST /api/users/otp-verify
        if (path === '/api/users/otp-verify' && req.method === 'POST') {
            const stored = otps.get(userSession.userId);
            if (!stored || stored.expires < Date.now()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'OTP expired' }));
                return;
            }
            const valid = await bcrypt.compare(req.body.otp, stored.hash);
            if (valid) {
                otps.delete(userSession.userId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid OTP' }));
            }
            return;
        }

        // GET /api/users (admin only)
        if (path === '/api/users' && req.method === 'GET') {
            if (userSession.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Accès refusé' }));
            }
            const users = await db.queryPromise('SELECT id, email, role, fullName, phone, created_at FROM users');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
    } catch (err) {
        logger.error('Users handler error', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Erreur serveur' }));
    }
}

// Fonctions utilitaires / service logic
async function getProfile(userId) {
    return new Promise((resolve) => {
db.query(
            'SELECT id, email, role, fullName, phone, address, postcode, ville, notif_prefs, twofa_enabled, twofa_secret, iban, bic_swift, bank_name, balance FROM users WHERE id = ?',
            [userId],
            (err, results) => {
                if (err) return resolve(null);
                const profile = results[0];
                if (profile && profile.notif_prefs) profile.notif_prefs = JSON.parse(profile.notif_prefs);
                resolve(profile);
            }
        );
    });
}

async function updateProfile(userId, data) {
    const { email, fullName, phone, address, postcode, ville, notif_prefs, twofa_enabled } = data;
    const fields = [], values = [];
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (fullName !== undefined) { fields.push('fullName = ?'); values.push(fullName); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }
    if (postcode !== undefined) { fields.push('postcode = ?'); values.push(postcode); }
    if (ville !== undefined) { fields.push('ville = ?'); values.push(ville); }
    if (notif_prefs !== undefined) { fields.push('notif_prefs = ?'); values.push(JSON.stringify(notif_prefs)); }
    if (twofa_enabled !== undefined) { fields.push('twofa_enabled = ?'); values.push(twofa_enabled); }
    values.push(userId);

    if (fields.length === 0) return { success: false, error: 'Aucune donnée' };

    return new Promise((resolve) => {
        db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values, (err, result) => {
            if (err) return resolve({ success: false, error: 'Erreur DB' });
            resolve({ success: true });
        });
    });
}

async function requestPasswordReset(email) {
    const user = await new Promise(r => db.query('SELECT id FROM users WHERE email = ?', [email], (e, res) => r(res[0])));
    if (!user) return { success: true, message: 'Email envoyé si existe' };
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: user.id, expires: Date.now() + 3600000 });
    logger.info('Password reset token generated', { email });
    return { success: true, message: 'Lien envoyé (token in console)' };
}

module.exports = handleUsers;

