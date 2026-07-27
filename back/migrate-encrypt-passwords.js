#!/usr/bin/env node
/**
 * Encrypts existing plaintext service passwords in compte.mdp.
 *
 * Usage:
 *   node --env-file=.env migrate-encrypt-passwords.js
 *
 * Safe to run multiple times: already-encrypted rows are skipped.
 */

const mysql = require('mysql2/promise');
const { encrypt, isEncrypted } = require('./crypto');

const datasource = {
    host: process.env.DATASOURCE_HOST,
    user: process.env.DATASOURCE_USER,
    password: process.env.DATASOURCE_PASSWORD,
    database: process.env.DATASOURCE_DATABASE
};

async function widenMdpColumn(connection) {
    const [columns] = await connection.query(
        `SELECT CHARACTER_MAXIMUM_LENGTH
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'compte' AND COLUMN_NAME = 'mdp'`,
        [datasource.database]
    );

    const maxLength = columns[0]?.CHARACTER_MAXIMUM_LENGTH;
    if (maxLength != null && maxLength < 500) {
        console.log('Widening compte.mdp column to VARCHAR(500)...');
        await connection.query('ALTER TABLE compte MODIFY mdp VARCHAR(500) NOT NULL');
    }
}

async function migrate() {
    const connection = await mysql.createConnection(datasource);

    try {
        await widenMdpColumn(connection);

        const [rows] = await connection.query('SELECT id, mdp FROM compte');
        let migrated = 0;
        let skipped = 0;

        for (const row of rows) {
            if (isEncrypted(row.mdp)) {
                skipped += 1;
                continue;
            }

            const encrypted = encrypt(row.mdp);
            await connection.query('UPDATE compte SET mdp = ? WHERE id = ?', [encrypted, row.id]);
            migrated += 1;
        }

        console.log(`Migration complete: ${migrated} encrypted, ${skipped} already encrypted, ${rows.length} total.`);
    } finally {
        await connection.end();
    }
}

migrate().catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});
