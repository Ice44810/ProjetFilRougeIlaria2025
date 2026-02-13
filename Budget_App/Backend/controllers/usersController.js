const db = require('../utils/db');
const bcrypt = require('bcrypt');
const { parse } = require('querystring');

exports.getProfile = (req, res, userSession) => {
    db.query('SELECT id, email, role FROM users WHERE id = ?', [userSession.userId], (err, results) => {
        if (err || results.length === 0) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Erreur serveur' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results[0]));
    });
};

exports.updateProfile = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { email, fullName, phone, address, postcode, ville } = parse(body);
        if (!email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email requis' }));
            return;
        }
        db.query('UPDATE users SET email = ?, fullName = ?, phone = ?, address = ?, postcode = ?, ville = ? WHERE id = ?',
            [email, fullName || null, phone || null, address || null, postcode || null, ville || null, userSession.userId], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur serveur' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Profil mis à jour' }));
        });
    });
};

exports.resetPassword = (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const { email } = parse(body);
        if (!email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email requis' }));
            return;
        }
        // For simplicity, just log the reset request. In production, send email with token.
        console.log(`Password reset requested for ${email}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Email de réinitialisation envoyé' }));
    });
};
