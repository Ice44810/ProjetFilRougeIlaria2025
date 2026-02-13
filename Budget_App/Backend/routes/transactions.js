const transactionsController = require('../controllers/transactionsController');

function handleTransactions(req, res, userSession) {
    if (req.method === 'GET') {
        transactionsController.getTransactions(req, res, userSession);
    } else if (req.method === 'POST') {
        transactionsController.createTransaction(req, res, userSession);
    } else if (req.method === 'PUT') {
        transactionsController.updateTransaction(req, res, userSession);
    } else if (req.method === 'DELETE') {
        transactionsController.deleteTransaction(req, res, userSession);
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Méthode non autorisée' }));
    }
}

module.exports = handleTransactions;
