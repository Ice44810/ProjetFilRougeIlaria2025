/**
 * Database Migration Script - Add Performance Indexes
 * Budget_App - Optimizations
 * 
 * This script adds indexes to improve query performance.
 * Run this script once to set up the database optimization.
 */

const db = require('./db');

console.log('Starting database optimization...');

const indexes = [
    // Users table indexes
    {
        name: 'idx_users_email',
        query: 'CREATE INDEX idx_users_email ON users(email)',
        table: 'users'
    },
    
    // Transactions table indexes
    {
        name: 'idx_transactions_user_id',
        query: 'CREATE INDEX idx_transactions_user_id ON transactions(user_id)',
        table: 'transactions'
    },
    {
        name: 'idx_transactions_user_created',
        query: 'CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at)',
        table: 'transactions'
    },
    {
        name: 'idx_transactions_type',
        query: 'CREATE INDEX idx_transactions_type ON transactions(type)',
        table: 'transactions'
    },
    {
        name: 'idx_transactions_category',
        query: 'CREATE INDEX idx_transactions_category ON transactions(category_id)',
        table: 'transactions'
    },
    
    // Categories table indexes
    {
        name: 'idx_categories_user_id',
        query: 'CREATE INDEX idx_categories_user_id ON categories(user_id)',
        table: 'categories'
    },
    
    // Cards table indexes
    {
        name: 'idx_cards_user_id',
        query: 'CREATE INDEX idx_cards_user_id ON cards(user_id)',
        table: 'cards'
    },
    
    // Recipients table indexes
    {
        name: 'idx_recipients_user_id',
        query: 'CREATE INDEX idx_recipients_user_id ON recipients(user_id)',
        table: 'recipients'
    },
    {
        name: 'idx_recipients_type',
        query: 'CREATE INDEX idx_recipients_type ON recipients(type)',
        table: 'recipients'
    }
];

// Function to create an index with error handling
const createIndex = (index) => {
    return new Promise((resolve) => {
        db.query(index.query, (err, result) => {
            if (err) {
                // Ignore "Duplicate key name" error (index already exists)
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`⚠️  Index ${index.name} already exists on ${index.table}`);
                    resolve({ success: true, status: 'exists' });
                } else {
                    console.error(`❌ Failed to create index ${index.name} on ${index.table}:`, err.message);
                    resolve({ success: false, status: 'error', error: err.message });
                }
            } else {
                console.log(`✅ Created index ${index.name} on ${index.table}`);
                resolve({ success: true, status: 'created' });
            }
        });
    });
};

// Execute all indexes sequentially
const runMigrations = async () => {
    let created = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const index of indexes) {
        const result = await createIndex(index);
        if (result.status === 'created') created++;
        else if (result.status === 'exists') skipped++;
        else failed++;
    }
    
    console.log('\n========================================');
    console.log(`Database optimization complete!`);
    console.log(`✅ Newly created: ${created}`);
    console.log(`⚠️  Already existed: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('========================================');
    process.exit(0);
};

runMigrations();

// Timeout safety
setTimeout(() => {
    console.error('Migration timeout - exiting');
    process.exit(1);
}, 10000);

