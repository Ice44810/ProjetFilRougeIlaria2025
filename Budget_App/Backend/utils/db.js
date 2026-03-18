const mysql = require('mysql');
const logger = require('./logger');

// Configuration id Mysql
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@123'
});

// Connexion à MySQL
db.connect((err) => {
    if (err) {
        logger.error('MySQL connection error', err);
        return;
    }
    logger.info('Connected to MySQL');
 
    // Création de la base de données si elle n'existe pas
db.query("CREATE DATABASE IF NOT EXISTS Backend_node", (err, result) => {
        if (err) {
            logger.error('Database creation error', err);
            return;
        }
        logger.info("Database 'Backend_node' ready.");

db.changeUser({ database: 'Backend_node' }, (err) => {
            if (err) {
                logger.error("Database switch error", err);
                return;
            }

            // Création des tables

            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                )
            `;

            // Gestion des erreurs 
db.query(createUsersTable, (err, result) => {
                if (err) {
                    logger.error("Users table creation error", err);
                    return;
                }
                logger.info("Users table ready.");
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
                    logger.error("Transactions table creation error", err);
                    return;
                }
                logger.info("Transactions table ready.");

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
                    logger.error("Categories table creation error", err);
                    return;
                }
                logger.info("Categories table ready.");
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

            // Ajouter une colonne rôle à la table des utilisateurs
            db.query(`ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user'`, (err, result) => {
                if (err && !err.message.includes('Duplicate column name')) {
                    console.error("Erreur lors de l'ajout de la colonne 'role' à 'users':", err);
                } else {
                    console.log("Colonne 'role' ajoutée à 'users'.");
                }
            });

            // Ajouter des colonnes de profil supplémentaires à la table des utilisateurs
            const profileColumns = [
                `ALTER TABLE users ADD COLUMN fullName VARCHAR(255) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN postcode VARCHAR(10) DEFAULT NULL`,
                `ALTER TABLE users ADD COLUMN ville VARCHAR(100) DEFAULT NULL`
            ];

            // ALTER TABLE ADD COLUMN : est une instruction SQL utilisée pour ajouter une nouvelle colonne à une table 
            // existante sans perdre les données existantes.

            profileColumns.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate column name')) {
                        console.error("Erreur lors de l'ajout d'une colonne de profil à 'users':", err);
                    } else {
                        console.log("Colonne de profil ajoutée à 'users'.");
                    }
                });
            });

            // ================= CRÉATION DES INDEXES =================
            
            // Index pour les transactions (recherche par utilisateur et date)
            const createTransactionIndexes = [
                'CREATE INDEX idx_transactions_user_id ON transactions(user_id)',
                'CREATE INDEX idx_transactions_created_at ON transactions(created_at)',
                'CREATE INDEX idx_transactions_type ON transactions(type)',
                'CREATE INDEX idx_transactions_category_id ON transactions(category_id)',
                'CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, created_at)'
            ];

            createTransactionIndexes.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate key name')) {
                        console.error("Erreur lors de la création d'un index sur transactions:", err);
                    }
                });
            });
            console.log("Indexes transactions créés.");

            // Index pour les catégories
            const createCategoryIndexes = [
                'CREATE INDEX idx_categories_user_id ON categories(user_id)'
            ];

            createCategoryIndexes.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate key name')) {
                        console.error("Erreur lors de la création d'un index sur categories:", err);
                    }
                });
            });
            console.log("Indexes categories créés.");

            // Index pour les cartes
            const createCardIndexes = [
                'CREATE INDEX idx_cards_user_id ON cards(user_id)'
            ];

            createCardIndexes.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate key name')) {
                        console.error("Erreur lors de la création d'un index sur cards:", err);
                    }
                });
            });
            console.log("Indexes cards créés.");

            // Index pour les bénéficiaires
            const createRecipientIndexes = [
                'CREATE INDEX idx_recipients_user_id ON recipients(user_id)',
                'CREATE INDEX idx_recipients_identifier ON recipients(identifier)'
            ];

            createRecipientIndexes.forEach(query => {
                db.query(query, (err, result) => {
                    if (err && !err.message.includes('Duplicate key name')) {
                        console.error("Erreur lors de la création d'un index sur recipients:", err);
                    }
                });
            });
            console.log("Indexes recipients créés.");
        });
    });
});

db.queryPromise = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

module.exports = db;
