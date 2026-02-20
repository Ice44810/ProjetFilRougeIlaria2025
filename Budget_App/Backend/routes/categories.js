const categoriesController = require('../controllers/categoriesController');

function handleCategories(req, res, userSession) {
    const { method } = req;
    const url = req.url;

    // GET /api/categories/:id - Get single category
    if (url.match(/^\/api\/categories\/\d+$/) && method === 'GET') {
        categoriesController.getCategoryById(req, res, userSession);
    }
    // GET /api/categories - Get all categories
    else if (url === '/api/categories' && method === 'GET') {
        categoriesController.getCategories(req, res, userSession);
    }
    // POST /api/categories - Create new category
    else if (url === '/api/categories' && method === 'POST') {
        categoriesController.createCategory(req, res, userSession);
    }
    // PUT /api/categories/:id - Update category
    else if (url.match(/^\/api\/categories\/\d+$/) && method === 'PUT') {
        categoriesController.updateCategory(req, res, userSession);
    }
    // DELETE /api/categories/:id - Delete category
    else if (url.match(/^\/api\/categories\/\d+$/) && method === 'DELETE') {
        categoriesController.deleteCategory(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
    }
}

module.exports = handleCategories;
