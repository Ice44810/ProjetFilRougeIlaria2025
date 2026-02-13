
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const db = require('./utils/db');
const handleTransactions = require('./routes/transactions');
const handleUsers = require('./routes/users');
const handleCategories = require('./routes/categories');
const handleCards = require('./routes/cards');
const handleRecipients = require('./routes/recipients');

const sessions = {}; // Stockage des sessions en mémoire

const server = http.createServer((req, res) => {
    const requestUrl = req.url;
    const method = req.method;
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    const userSession = sessions[sessionId];

    // --- 1. FICHIERS STATIQUES ---
    if (requestUrl.toLowerCase().startsWith('/public/')) {
        const relativePath = requestUrl.replace(/^\/[Pp]ublic\//, 'public/');
        const filePath = path.join(__dirname, relativePath);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Static file not found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png',
                '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
                 '.gif': 'image/gif', '.ico': 'image/x-icon'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(content);
        });
        return;
    }

    // --- 2. ROUTES D'ACTIONS (API) ---
    // Inscription
    if (requestUrl === '/register' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { email, password } = parse(body);
            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email et mot de passe requis' }));
                return;
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user'], (err, result) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Erreur lors de la création du compte' }));
                        return;
                    }
                    res.writeHead(302, { 'Location': '/login.html?message=registration_success' });
                    res.end();
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Erreur de hachage de mot de passe' }));
            }
        });
        return;
    }

    // Connexion
    if (requestUrl === '/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { email, password } = parse(body);
            db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
                if (err || results.length === 0) {
                    res.writeHead(302, { 'Location': '/login.html?error=invalid_credentials' });
                    res.end();
                    return;
                }
                const user = results[0];
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const newSessionId = Date.now().toString();
                    sessions[newSessionId] = { userId: user.id, email: user.email, role: user.role };
                    res.setHeader('Set-Cookie', cookie.serialize('sessionId', newSessionId, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' }));
                    res.writeHead(302, { 'Location': '/index.html' });
                    res.end();
                } else {
                    res.writeHead(302, { 'Location': '/login.html?error=invalid_credentials' });
                    res.end();
                }
            });
        });
        return;
    }
    
    // Déconnexion
    if (requestUrl === '/logout') {
        if (sessionId) delete sessions[sessionId];
        res.setHeader('Set-Cookie', cookie.serialize('sessionId', '', { httpOnly: true, expires: new Date(0), path: '/' }));
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
        return;
    }

    // Password reset (public endpoint)
    if (requestUrl === '/api/reset-password' && method === 'POST') {
        const usersController = require('./controllers/usersController');
        usersController.resetPassword(req, res);
        return;
    }

    // --- 3. GESTION DES ROUTES API ---
    if (requestUrl.startsWith('/api/')) {
        // Pour les routes API, on vérifie la session en premier
        if (!userSession) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Non autorisé' }));
            return;
        }

        // Route API pour les données de la page d'accueil
        if (requestUrl === '/api/home' && method === 'GET') {
            // Compute balance from transactions
            db.query('SELECT SUM(CASE WHEN type="income" THEN amount ELSE -amount END) as balance FROM transactions WHERE user_id = ?',
                [userSession.userId], (err, balanceResult) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                }
                const balance = balanceResult[0].balance || 0;

                // Get last 5 transactions
                db.query('SELECT id, title, amount, type, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
                    [userSession.userId], (err, transactions) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Erreur serveur' }));
                    }

                    // Static rewards for now, can be made dynamic later
                    const rewards = 50;

                    const responseData = {
                        balance: balance.toFixed(2),
                        currency: '€',
                        rewards: rewards,
                        lastTransactions: transactions.map(tx => ({
                            title: tx.title,
                            amount: tx.type === 'income' ? parseFloat(tx.amount) : -parseFloat(tx.amount)
                        }))
                    };

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(responseData));
                });
            });
            return;
        }

        // Transactions
        if (requestUrl.startsWith('/api/transactions')) {
            handleTransactions(req, res, userSession);
            return;
        }

        // Users (profile management)
        if (requestUrl.startsWith('/api/users')) {
            handleUsers(req, res, userSession);
            return;
        }

        // Categories
        if (requestUrl.startsWith('/api/categories')) {
            handleCategories(req, res, userSession);
            return;
        }

        // Cards
        if (requestUrl.startsWith('/api/cards')) {
            handleCards(req, res, userSession);
            return;
        }

        // Recipients
        if (requestUrl.startsWith('/api/recipients')) {
            handleRecipients(req, res, userSession);
            return;
        }

        // Stats for visualization
        if (requestUrl === '/api/stats' && method === 'GET') {
            db.query(`
                SELECT c.name as category, SUM(t.amount) as total, t.type
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
                GROUP BY c.name, t.type
            `, [userSession.userId], (err, results) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Erreur serveur' }));
                    return;
                }
                // Monthly evolution
                db.query(`
                    SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
                    FROM transactions
                    WHERE user_id = ?
                    GROUP BY month
                    ORDER BY month
                `, [userSession.userId], (err, monthly) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Erreur serveur' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ categoryTotals: results, monthlyEvolution: monthly }));
                });
            });
            return;
        }

        // Si aucune autre route API ne correspond, renvoyer une 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint API non trouvé' }));
        return;
    }

    // --- 4. SERVIR LES PAGES HTML ---
    const cleanPath = requestUrl.split('?')[0];
    
    // Pages publiques (accessibles sans connexion)
    const publicPages = ['/login.html', '/inscription.html', '/resetpassword.html'];
    if (publicPages.includes(cleanPath)) {
        const pageName = cleanPath.substring(1);
        const filePath = path.join(__dirname, 'pages', pageName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            }
        });
        return;
    }

    // Protection pour les pages HTML : si pas de session, redirection
    if (!userSession) {
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
        return;
    }
    
    // Pages protégées (nécessitent une connexion)
    let pageName = cleanPath === '/' ? 'index.html' : cleanPath.substring(1);
     if (!pageName.endsWith('.html')) {
        pageName += '.html';
    }
    
    const htmlFilePath = path.join(__dirname, 'pages', pageName);

    fs.readFile(htmlFilePath, (err, data) => {
        if (err) {
            console.error("Fichier non trouvé :", htmlFilePath);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Page introuvable</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        }
    });
});

server.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});