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

            const createTransactionsTable = `
                CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    type ENUM('income','expense') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    category_id INT DEFAULT NULL
                )
            `;

            db.query(createTransactionsTable, (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création de la table 'transactions':", err);
                    return;
                }
                console.log("Table 'transactions' prête.");

                // Add category_id column to transactions table if it doesn't exist
                db.query(`ALTER TABLE transactions ADD COLUMN category_id INT DEFAULT NULL`, (err, result) => {
                    if (err && !err.message.includes('Duplicate column name')) {
                        console.error("Erreur lors de l'ajout de la colonne 'category_id' à 'transactions':", err);
                    } else {
                        console.log("Colonne 'category_id' ajoutée à 'transactions'.");
                    }
                });
            });

            const createCategoriesTable = `
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    user_id INT NOT NULL
                )
            `;

            db.query(createCategoriesTable, (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création de la table 'categories':", err);
                    return;
                }
                console.log("Table 'categories' prête.");
            });

            const createCardsTable = `
                CREATE TABLE IF NOT EXISTS cards (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    card_holder_name VARCHAR(255) NOT NULL,
                    last_4_digits VARCHAR(4) NOT NULL,
                    expiry_date VARCHAR(7) NOT NULL,
                    card_brand VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            db.query(createCardsTable, (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création de la table 'cards':", err);
                    return;
                }
                console.log("Table 'cards' prête.");
            });

            const createRecipientsTable = `
                CREATE TABLE IF NOT EXISTS recipients (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    identifier VARCHAR(255) NOT NULL,
                    type ENUM('phone', 'bank') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            db.query(createRecipientsTable, (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création de la table 'recipients':", err);
                    return;
                }
                console.log("Table 'recipients' prête.");
            });

            // Add role column to users table
            db.query(`ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user'`, (err, result) => {
                if (err && !err.message.includes('Duplicate column name')) {
                    console.error("Erreur lors de l'ajout de la colonne 'role' à 'users':", err);
                } else {
                    console.log("Colonne 'role' ajoutée à 'users'.");
                }
            });

            // Add additional profile columns to users table
            const profileColumns = [
                `ALTER TABLE users ADD COLUMN fullName VARCHAR(255) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN postcode VARCHAR(10) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN ville VARCHAR(100) DEFAULT NULL`
            ];

            profileColumns.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate column name')) {
                        console.error("Erreur lors de l'ajout d'une colonne de profil à 'users':", err);
                    } else {
                        console.log("Colonne de profil ajoutée à 'users'.");
                    }
                });
            });
        });
    });
});

module.exports = db;
