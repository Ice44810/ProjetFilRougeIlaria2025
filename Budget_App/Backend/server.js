const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse } = require('querystring');
const bcrypt = require('bcrypt');
const cookie = require('cookie');

const db = require('./utils/db');
const router = require('./routes/router');
const logger = require('./utils/logger');

const handleTransactions = require('./routes/transactions');
const handleUsers = require('./routes/users');
const handleCategories = require('./routes/categories');
const handleCards = require('./routes/cards');
const handleRecipients = require('./routes/recipients');
const handleStats = require('./routes/stats');

const sessions = {};

// ================= HELPER FUNCTIONS =================

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
}

function requireAuth(req, res, userSession) {
    if (!userSession) {
        sendJson(res, 401, { message: 'Non autorisé' });
        return false;
    }
    return true;
}

// Nettoyage automatique sessions expirées
setInterval(() => {
    const now = Date.now();
    for (const sessionId in sessions) {
        if (sessions[sessionId].expires < now) {
            delete sessions[sessionId];
        }
    }
}, 1000 * 60 * 60);

// ================= SERVER =================

const server = http.createServer((req, res) => {

    const startTime = Date.now();
    const requestUrl = req.url;
    const method = req.method;

    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    const userSession = sessions[sessionId];

    logger.info('Incoming request', { method, url: requestUrl });

    // ================= STATIC FILES =================

    if (requestUrl.toLowerCase().startsWith('/public/')) {
        const relativePath = requestUrl.replace(/^\/[Pp]ublic\//, 'public/');
        const filePath = path.join(__dirname, relativePath);

        fs.readFile(filePath, (err, content) => {

            if (err) {
                logger.error('Static file not found', { path: filePath });
                res.writeHead(404);
                return res.end('Static file not found');
            }

            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.gif': 'image/gif',
                '.ico': 'image/x-icon'
            };

            const duration = Date.now() - startTime;
            
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(content);
            logger.logRequest(method, requestUrl, 200, duration);
        });

        return;
    }

    // ================= REGISTER =================

    if (requestUrl === '/register' && method === 'POST') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on('end', async () => {

            const { email, password } = parse(body);

            if (!email || !password) {
                return sendJson(res, 400, { message: 'Email et mot de passe requis' });
            }

            db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {

                if (err) {
                    logger.error('Register check failed', { error: err.message });
                    return sendJson(res, 500, { message: 'Erreur serveur' });
                }

                if (results.length > 0) {
                    return sendJson(res, 409, { message: 'Email déjà utilisé' });
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 12);

                    db.query(
                        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                        [email, hashedPassword, 'user'],
                        (err, result) => {

                            if (err) {
                                logger.error('Registration failed', { error: err.message });
                                return sendJson(res, 500, { message: 'Erreur création compte' });
                            }

                            logger.info('User registered', { userId: result.insertId });
                            res.writeHead(302, { Location: '/login.html?message=registration_success' });
                            res.end();
                        }
                    );

                } catch (error) {
                    logger.error('Hash error', { error: error.message });
                    return sendJson(res, 500, { message: 'Erreur serveur' });
                }
            });
        });

        return;
    }

    // ================= LOGIN =================

    if (requestUrl === '/login' && method === 'POST') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1e6) req.connection.destroy();
        });

        req.on('end', () => {

            const { email, password } = parse(body);

            if (!email || !password) {
                return sendJson(res, 400, { message: 'Email et mot de passe requis' });
            }

            db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {

                if (err) {
                    logger.error('Login query failed', { error: err.message });
                    return sendJson(res, 500, { message: 'Erreur serveur' });
                }

                if (!results.length) {
                    return sendJson(res, 401, { message: 'Identifiants invalides' });
                }

                const user = results[0];
                
                let match = false;
                try {
                    match = await bcrypt.compare(password, user.password);
                } catch (bcryptError) {
                    logger.error('Bcrypt compare error', { error: bcryptError.message });
                    return sendJson(res, 500, { message: 'Erreur serveur' });
                }

                if (!match) {
                    return sendJson(res, 401, { message: 'Identifiants invalides' });
                }

                const newSessionId = crypto.randomBytes(32).toString('hex');

                sessions[newSessionId] = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    expires: Date.now() + (1000 * 60 * 60 * 24 * 7)
                };

                res.setHeader('Set-Cookie',
                    cookie.serialize('sessionId', newSessionId, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 60 * 60 * 24 * 7,
                        path: '/'
                    })
                );

                res.writeHead(302, { Location: '/index.html' });
                res.end();
            });
        });

        return;
    }

    // ================= LOGOUT =================

    if (requestUrl === '/logout') {

        if (sessionId) delete sessions[sessionId];

        res.setHeader('Set-Cookie',
            cookie.serialize('sessionId', '', {
                httpOnly: true,
                expires: new Date(0),
                path: '/'
            })
        );

        res.writeHead(302, { Location: '/login.html' });
        res.end();
        return;
    }

    // ================= API =================

    if (requestUrl.startsWith('/api/')) {

        if (!requireAuth(req, res, userSession)) return;

        if (requestUrl.startsWith('/api/transactions'))
            return handleTransactions(req, res, userSession);

        if (requestUrl.startsWith('/api/users'))
            return handleUsers(req, res, userSession);

        if (requestUrl.startsWith('/api/categories'))
            return handleCategories(req, res, userSession);

        if (requestUrl.startsWith('/api/cards'))
            return handleCards(req, res, userSession);

        if (requestUrl.startsWith('/api/recipients'))
            return handleRecipients(req, res, userSession);

        if (requestUrl.startsWith('/api/stats') || requestUrl.startsWith('/api/balance') || requestUrl.startsWith('/api/home') || requestUrl.startsWith('/api/topup'))
            return handleStats(req, res, userSession);

        return router(req, res);
    }

    // ================= HTML PAGES =================

    const cleanPath = requestUrl.split('?')[0];
    const publicPages = ['/login.html', '/inscription.html', '/resetpassword.html'];

    if (!publicPages.includes(cleanPath) && !userSession) {
        res.writeHead(302, { Location: '/login.html' });
        return res.end();
    }

    let pageName = cleanPath === '/' ? 'index.html' : cleanPath.substring(1);
    if (!pageName.endsWith('.html')) pageName += '.html';

    const filePath = path.join(__dirname, 'pages', pageName);

    fs.readFile(filePath, (err, data) => {

        if (err) {
            res.writeHead(404);
            return res.end('<h1>404 - Page introuvable</h1>');
        }

        // Sécurisation des en-têtes HTTP pour les pages HTML rendues dynamiquement (évite les attaques XSS, clickjacking, etc.)
        setSecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
});

// ================= START SERVER =================

server.listen(3000, () => {
    logger.info('Budget_App Server Started');
    logger.info('Server running on http://localhost:3000');
    
});
