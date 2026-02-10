const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
    const requestUrl = req.url;
    const method = req.method;

    // --- 1. FICHIERS STATIQUES (CSS, Images, JS) ---
    // On vérifie si l'URL commence par /public/ (peu importe la casse)
    if (requestUrl.toLowerCase().startsWith('/public/')) {
        
        // On force le chemin vers le dossier 'public' en minuscule 
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
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(content);
        });
        return;
    }

    // --- 2. ROUTES ACTIONS ---
    if (requestUrl === '/login-action' && method === 'POST') {
        // ... (ton code de login)
        return;
    }

    // --- 3. GESTION DYNAMIQUE DES PAGES HTML ---
    const cleanPath = requestUrl.split('?')[0];
    let pageName = cleanPath === '/' ? 'index' : cleanPath.substring(1);

    // Supprime .html s'il est déjà présent dans l'URL pour éviter le .html.html
    if (pageName.toLowerCase().endsWith('.html')) {
        pageName = pageName.slice(0, -5);
    }

    const htmlFilePath = path.join(__dirname, 'Pages', `${pageName}.html`);

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