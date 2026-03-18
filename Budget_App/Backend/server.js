const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cookie = require('cookie');

const db = require('./utils/db');
const logger = require('./utils/logger');
const parseBody = require('./middleware/parseBody');
const { requireAuth } = require('./middleware/auth');

const { handleTransactions } = require('./handlers/transactions');
const handleUsers = require('./handlers/users');
const handleCategories = require('./handlers/categories');
const handleCards = require('./handlers/cards');
const handleRecipients = require('./handlers/recipients');
const handleStats = require('./handlers/stats');
const handleTransfers = require('./handlers/transfers');
const handleServices = require('./handlers/services');

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

const server = http.createServer(async (req, res) => {

    const startTime = Date.now();
    const requestUrl = req.url;
    const method = req.method;

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
            try {
                await parseBody(req, res);
                const { email, password } = req.body;
            } catch(e) {
                return sendJson(res, 400, { message: 'Bad request' });
            }

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
    // 1. On laisse parseBody gérer la lecture du flux entièrement
    parseBody(req, res).then(() => {
        const { email, password } = req.body || {};

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
                // Utilisation de bcrypt comme dans ton code
                match = await bcrypt.compare(password, user.password);
            } catch (bcryptError) {
                logger.error('Bcrypt compare error', { error: bcryptError.message });
                return sendJson(res, 500, { message: 'Erreur serveur' });
            }

            if (!match) {
                return sendJson(res, 401, { message: 'Identifiants invalides' });
            }

            // ... Suite de ton code (création session, cookie, redirection) ...
            const newSessionId = crypto.randomBytes(32).toString('hex');
            sessions[newSessionId] = {
                userId: user.id,
                email: user.email,
                role: user.role,
                expires: Date.now() + (1000 * 60 * 60 * 24 * 7)
            };

            res.setHeader('Set-Cookie', cookie.serialize('sessionId', newSessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            }));

            res.writeHead(302, { Location: '/index.html' });
            res.end();
        });
    }).catch(err => {
        logger.error('Parse body error', err);
        sendJson(res, 400, { message: 'Erreur lors de la lecture des données' });
    });

    return; // Important pour ne pas continuer dans le reste du serveur
}

    // ================= LOGOUT =================

    if (requestUrl === '/logout') {
        const cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.sessionId;
        if (sessionId && sessions[sessionId]) {
            delete sessions[sessionId];
        }

        res.setHeader('Set-Cookie',
            cookie.serialize('sessionId', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0),
                path: '/'
            })
        );

        res.writeHead(302, { Location: '/login.html' });
        res.end();
        return;
    }

    // ================= API =================

        // API routes
        if (requestUrl.startsWith('/api/')) {
            logger.info('API request', { method, url: requestUrl });

            try {
                // Parse body first
                await new Promise((resolve, reject) => {
                    parseBody(req, res).then(resolve).catch((err) => {
                        logger.error('ParseBody error', err);
                        if (!res.headersSent) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid request body' }));
                        }
                        reject(err);
                    });
                });

                // Auth check
                const cookies = cookie.parse(req.headers.cookie || '');
                const sessionId = cookies.sessionId;
                req.userSession = sessions[sessionId];
                if (!req.userSession) {
                    if (!res.headersSent) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Non autorisé' }));
                    }
                    return;
                }

                // Route to handler
                if (requestUrl.startsWith('/api/transactions')) return handleTransactions(req, res, req.userSession);
                if (requestUrl.startsWith('/api/users')) return handleUsers(req, res, req.userSession);
                if (requestUrl.startsWith('/api/categories')) return handleCategories(req, res, req.userSession);
                if (requestUrl.startsWith('/api/cards')) return handleCards(req, res, req.userSession);
                if (requestUrl.startsWith('/api/recipients')) return handleRecipients(req, res, req.userSession);
                if (requestUrl.startsWith('/api/transfers')) return handleTransfers(req, res, req.userSession);
                if (requestUrl.startsWith('/api/services')) return handleServices(req, res, req.userSession);
                if (requestUrl.startsWith('/api/stats') || requestUrl.startsWith('/api/balance') || requestUrl.startsWith('/api/home') || requestUrl.startsWith('/api/topup')) return handleStats(req, res, req.userSession);

                if (!res.headersSent) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Endpoint non trouvé' }));
                }
            } catch (err) {
                logger.error('API middleware error', err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Erreur interne' }));
                }
            }
            return;
        }

    // ================= HTML PAGES =================

    const cleanPath = requestUrl.split('?')[0];
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    const userSession = sessions[sessionId];
    const publicPages = ['/login.html', '/inscription.html', '/resetpassword.html', '/resetpassword.html'];

    if (!publicPages.includes(cleanPath) && !userSession) {
        res.writeHead(302, { Location: '/login.html' });
        return res.end();
    }

    // Alias & case-insensitive mapping
    let pageName = cleanPath === '/' ? 'index.html' : cleanPath.substring(1);
    if (!pageName.endsWith('.html')) pageName += '.html';

    const aliases = {
        'profile.html': 'Profile.html',
        'home.html': 'index.html',
        'bill.html': 'bill.html',
        'tansfertbank.html': 'transferbybank.html',
        'transfer-bank.html': 'transferbybank.html'
    };

    const lowerPageName = pageName.toLowerCase();
    if (aliases[lowerPageName] && aliases[lowerPageName] !== pageName) {
        logger.info('Page alias redirect', { from: pageName, to: aliases[lowerPageName] });
        res.writeHead(302, { Location: '/' + aliases[lowerPageName] });
        return res.end();
    }

    const filePath = path.join(__dirname, 'pages', pageName);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error('Page not found', { path: filePath, pageName });
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`<h1>404 - Page introuvable: ${pageName}</h1><p><a href="/index.html">Retour accueil</a></p>`);
        }

        setSecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
        const duration = Date.now() - startTime;
        logger.logRequest(method, requestUrl, 200, duration);
    });
});

// ================= START SERVER =================

server.listen(3000, () => {
    logger.info('Budget_App Server Started');
    logger.info('Server running on http://localhost:3000');
    
});
