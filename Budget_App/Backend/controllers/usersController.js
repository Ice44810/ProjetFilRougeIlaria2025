const db = require('../utils/db');
const bcrypt = require('bcrypt');


 // RÉCUPÉRER le profil de l'utilisateur
 // Note : On ne sélectionne JAMAIS le champ 'password' par sécurité.
 
exports.getProfile = (req, res, userSession) => {
    // On récupère les infos de base + les nouvelles colonnes (fullName, phone, etc.)
    db.query(
        'SELECT id, email, role, fullName, phone, address, postcode, ville FROM users WHERE id = ?', 
        [userSession.userId], 
        (err, results) => {
            if (err) {
                console.error('Erreur getProfile:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Erreur serveur' }));
            }
            if (results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Utilisateur non trouvé' }));
            }
            // On renvoie l'objet utilisateur (sans le mot de passe)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
        }
    );
};

// METTRE À JOUR le profil
exports.updateProfile = (req, res, userSession) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { email, fullName, phone, address, postcode, ville } = JSON.parse(body);

            if (!email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'L\'email est requis' }));
            }

            // Validation basique de l'email
            if (!email.includes('@')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Format d\'email invalide' }));
            }

            const query = `
                UPDATE users 
                SET email = ?, fullName = ?, phone = ?, address = ?, postcode = ?, ville = ? 
                WHERE id = ?`;
            
            const params = [
                email.trim().toLowerCase(), 
                fullName || null, 
                phone || null, 
                address || null, 
                postcode || null, 
                ville || null, 
                userSession.userId
            ];

            db.query(query, params, (err, result) => {
                if (err) {
                    // Si l'email est déjà pris par un autre utilisateur (clé UNIQUE en DB)
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Cet email est déjà utilisé' }));
                    }
                    console.error('Erreur updateProfile:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur lors de la mise à jour' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Profil mis à jour avec succès' }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Données JSON invalides' }));
        }
    });
};

// RÉINITIALISER le mot de passe (Simulation)
exports.resetPassword = (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { email } = JSON.parse(body);
            if (!email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Email requis pour la réinitialisation' }));
            }

            // Étape de sécurité : Vérifier si l'utilisateur existe avant de "simuler" l'envoi
            db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                }

                // Note : Pour éviter le "User Enumeration", on renvoie souvent le même message 
                // même si l'email n'existe pas. Ici, on va rester simple pour le debug.
                console.log(`[LOG] Password reset token generated for ${email}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
                }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Données JSON invalides' }));
        }
    });
};
