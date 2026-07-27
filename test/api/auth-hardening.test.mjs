import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mysql = require(path.join(ROOT, 'back/node_modules/mysql2'));
const mysqlPromise = require(path.join(ROOT, 'back/node_modules/mysql2/promise'));
const Data = require(path.join(ROOT, 'back/data.js'));

const datasource = {
    host: process.env.DATASOURCE_HOST || '127.0.0.1',
    user: process.env.DATASOURCE_USER || 'passwd',
    password: process.env.DATASOURCE_PASSWORD || 'passwd',
    database: process.env.DATASOURCE_DATABASE || 'passwd'
};

const TEST_USER = 'auth-hardening-user';
const TEST_PASSWORD = 'hardening-pass-123';

async function ensureTestUser() {
    const hash = require(path.join(ROOT, 'back/node_modules/bcryptjs')).hashSync(TEST_PASSWORD, 10);
    const db = await mysqlPromise.createConnection(datasource);
    try {
        await db.query('DELETE FROM user WHERE login = ?', [TEST_USER]);
        await db.query(
            'INSERT INTO user (login, password, date_quota, used_quota) VALUES (?, ?, NULL, 0)',
            [TEST_USER, hash]
        );
    } finally {
        await db.end();
    }
}

async function cleanupTestUser() {
    const db = await mysqlPromise.createConnection(datasource);
    try {
        await db.query('DELETE FROM user WHERE login = ?', [TEST_USER]);
    } finally {
        await db.end();
    }
}

async function getUserState(connection) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT used_quota, date_quota FROM user WHERE login = ?',
            [TEST_USER],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            }
        );
    });
}

function query(connection, sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export async function runAuthHardeningTests() {
    const connection = mysql.createConnection(datasource);
    const data = new Data(connection);

    try {
        await ensureTestUser();

        await assert.rejects(
            () => data.authentify(TEST_USER, 'wrong-password'),
            /AUTH_FAILED/,
            'invalid password should fail authentication'
        );

        let state = await getUserState(connection);
        assert.equal(state.used_quota, 1, 'failed login should increment used_quota');
        assert.ok(state.date_quota, 'failed login should store the failure date in date_quota');

        await data.authentify(TEST_USER, TEST_PASSWORD);
        state = await getUserState(connection);
        assert.equal(state.used_quota, 1, 'successful login within 50 days should not reset used_quota');

        await query(
            connection,
            'UPDATE user SET used_quota = 12, date_quota = DATE_SUB(CURDATE(), INTERVAL 51 DAY) WHERE login = ?',
            [TEST_USER]
        );

        await data.authentify(TEST_USER, TEST_PASSWORD);
        state = await getUserState(connection);
        assert.equal(state.used_quota, 0, 'successful login after 50 days without failure should reset used_quota');

        const beforeUnknown = await getUserState(connection);
        await assert.rejects(
            () => data.authentify('unknown-user-auth-hardening', 'any-password'),
            /AUTH_FAILED/
        );
        const afterUnknown = await getUserState(connection);
        assert.equal(
            afterUnknown.used_quota,
            beforeUnknown.used_quota,
            'unknown usernames should not change an existing user quota'
        );
    } finally {
        await cleanupTestUser();
        connection.end();
    }
}

export async function runLoginRateLimitTests() {
    const API_URL = process.env.API_URL || 'http://127.0.0.1:3001/api';
    const attempts = Number(process.env.LOGIN_RATE_LIMIT_MAX || 10) + 1;
    let saw429 = false;

    for (let index = 0; index < attempts; index += 1) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'rate-limit-user', password: 'wrong-password' })
        });

        if (response.status === 429) {
            saw429 = true;
            break;
        }
    }

    assert.ok(saw429, 'login endpoint should return HTTP 429 after too many requests from one IP');
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const mode = process.argv[2] || 'quota';
    const runner = mode === 'rate-limit' ? runLoginRateLimitTests : runAuthHardeningTests;
    runner().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
