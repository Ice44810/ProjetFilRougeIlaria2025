const categoriesController = require('../controllers/categoriesController');

function handleCategories(req, res, userSession) {
    if (req.method === 'GET') {
        categoriesController.getCategories(req, res, userSession);
    } else if (req.method === 'POST') {
        categoriesController.createCategory(req, res, userSession);
    } else if (req.method === 'PUT') {
        categoriesController.updateCategory(req, res, userSession);
    } else if (req.method === 'DELETE') {
        categoriesController.deleteCategory(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
    }
}

module.exports = handleCategories;
