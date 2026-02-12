const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const db = require('./utils/db');

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
                db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
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
                    sessions[newSessionId] = { userId: user.id, email: user.email };
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


    // --- 3. SERVIR LES PAGES HTML ---
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

    // Protection des routes : si pas de session, redirection vers login
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