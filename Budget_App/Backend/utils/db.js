const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'issa',
    password: 'Passer@123'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL:', err);
        return;
    }
    console.log('Connecté à MySQL');

    db.query("CREATE DATABASE IF NOT EXISTS budget_app", (err, result) => {
        if (err) {
            console.error("Erreur lors de la création de la base de données:", err);
            return;
        }
        console.log("Base de données 'budget_app' prête.");

        db.changeUser({ database: 'budget_app' }, (err) => {
            if (err) {
                console.error("Erreur lors du changement vers la base de données 'budget_app':", err);
                return;
            }

            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                )
            `;

            db.query(createUsersTable, (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création de la table 'users':", err);
                    return;
                }
                console.log("Table 'users' prête.");
            });
        });
    });
});

module.exports = db;
