const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('./crypto');

const QUOTA_MAX_ATTEMPTS = 50;
const QUOTA_RESET_AFTER_DAYS = 50;
// Always run bcrypt.compare, even when the username does not exist. Without this
// dummy hash, unknown usernames would fail before bcrypt and return faster than
// known usernames, letting an attacker enumerate valid logins via response time.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('__invalid_login_probe__', 10);

const accountTable = 'compte';
const siteTable = 'site';
const userTable = 'user';
const accountColumns = ['id', 'login', 'mdp', 'id_site', 'user']
const siteColumns = ['libelle', 'url'];
const accountColumnsAlias = accountColumns.map(column => `${accountTable}.${column}`).join(', ');
const siteColumnsAlias = siteColumns.map(column => `${siteTable}.${column}`).join(', ');
const selectQuery = `
        SELECT DISTINCT ${accountColumnsAlias}, ${siteColumnsAlias}
        FROM ${accountTable} 
        INNER JOIN ${siteTable} ON ${siteTable}.id = ${accountTable}.id_site 
        INNER JOIN ${userTable} ON ${userTable}.login = ${accountTable}.user `;

class Data {

    constructor(con) {
        if (!con) {
            throw Error('connection required');
        }
        this.con = con;
    }

    find(currentUser, searchTerm) {
        const sql = `${selectQuery}
        WHERE user = ? ${ searchTerm ? 'AND (lower(libelle) like ? OR lower(url) like ?)' : ''}
        LIMIT 30`;

        let params = [currentUser];
        if (searchTerm) {
            const likeParam = `%${searchTerm.toLowerCase()}%`;
            params = [...params, likeParam, likeParam];
        }

        return new Promise((resolve, reject) => {
            this.con.query(sql, params, (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${sql} : \n ${error.sqlMessage}` : error);
                } else {
                    resolve(result.map(res => this.mapToAccount(res)));
                }
            });
        });
    };

    findByAccountId(currentUser, id) {
        const sql = `${selectQuery}
        WHERE user = ? AND ${accountTable}.id = ? `;

        return new Promise((resolve, reject) => {
            this.con.query(sql, [currentUser, id], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${sql} : \n ${error.sqlMessage}` : error);
                } else {
                    resolve(result.map(res => this.mapToAccount(res)));
                }
            });
        });
    }

    findBySiteName(currentUser, siteName) {
        const sql = `${selectQuery}
        WHERE user = ? AND ${siteTable}.libelle = ? `;

        return new Promise((resolve, reject) => {
            this.con.query(sql, [currentUser, siteName], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${sql} : \n ${error.sqlMessage}` : error);
                } else {
                    resolve(this.mapToSites(result));
                }
            });
        });
    }

    createSite(site) {
        const sql = `insert into ${siteTable}(libelle, url) values(?, ?)`;
        const tableRow = this.mapFromSite(site);

        return new Promise((resolve, reject) => {
            this.con.query(sql, [tableRow.libelle, tableRow.url], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${sql} : \n ${error.sqlMessage}` : error);
                } else {
                    resolve(this.mapToSite({...site, id_site: result.insertId}));
                }
            });
        });
    }

    createAccount(currentUser, site, account) {
        const sql = `insert into ${accountTable}(id_site, login, mdp, user) values(?, ?, ?, ?)`;
        const tableRowSite = this.mapFromSite(site);
        const tableRowAccount = this.mapFromAccount(account);

        return new Promise((resolve, reject) => {
            this.con.query(sql, [tableRowSite.id, tableRowAccount.login, tableRowAccount.mdp, currentUser], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${sql} : \n ${error.sqlMessage}` : error);
                } else {
                    resolve(this.mapToAccount({...account, id_site: site.id, id: result.insertId}));
                }
            });
        });
    }

    updateAccountAndSite(currentUser, object) {
        const tableRow = this.mapFromAccount(object);
        const queryAccount = `update ${accountTable} set login = ?, mdp = ?  where id = ? and user = ?`;
        return new Promise((resolve, reject) => {
            this.con.query(queryAccount, [tableRow.login, tableRow.mdp, tableRow.id, currentUser], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${queryAccount} : \n ${error.sqlMessage}` : error);
                } else {
                    const querySite = `update ${siteTable} set url = ?, libelle = ?  where id = ?`;

                    this.con.query(querySite, [tableRow.url, tableRow.libelle, tableRow.site_id], (err, _result) => {
                        if (err) {
                            reject(err.sqlMessage ? `${querySite} : \n ${err.sqlMessage}` : err);
                        } else {
                            if (result.affectedRows === 0) {
                                reject(`No row to update having id ${tableRow.id} for user ${currentUser}`)
                            } else {
                                resolve();
                            }
                        }
                    });
                }
            });
        });
    }

    deleteAccount(currentUser, id) {
        const sql = `delete from ${accountTable} where id = ? and user = ?`;
        return new Promise((resolve, reject) => {
            this.con.query(sql, [id, currentUser], (error, result) => {
                if (error) {
                    reject(error.sqlMessage ? `${queryAccount} : \n ${error.sqlMessage}` : error);
                } else {
                    if (result.affectedRows === 0) {
                        reject(`No row to delete having id ${id} for user ${currentUser}`)
                    } else {
                        resolve();
                    }
                }
            });
        });
    }

    mapToAccount(tableRow) {
        return {
            id: tableRow.id,
            idSite: tableRow.id_site,
            url: tableRow.url,
            name: tableRow.libelle,
            username: tableRow.login,
            password: decrypt(tableRow.mdp)
        };
    }

        
    mapToSite(tableRow) {
        return {
            id: tableRow.id_site,
            name: tableRow.libelle,
            url: tableRow.url
        };
    }
    
    mapToSites(tableRows) {
        const siteMap = new Map();
        for (tableRow in tableRows) {
            if (siteMap.has(tableRow.id_site)) {
                const site = siteMap.get(tableRow.id_site);
                site.accounts.push(this.mapToAccount(tableRow));
            } else {
                siteMap.set(tableRow.id_site, {...this.mapToSite(tableRow), accounts: [this.mapToAccount(tableRow)]});
            }
        }
        return siteMap.values();
    }

    mapFromSite(object) {
        return {
            id: object.id,
            url: object.url,
            libelle: object.name,
        };
    }

    mapFromAccount(object) {
        return {
            id: object.id,
            id_site: object.idSite,
            url: object.url,
            libelle: object.name,
            login: object.username,
            mdp: encrypt(object.password)
        };
    }

    authentify(username, password) {
        return this.findUserForLogin(username)
            .then(user => {
                const storedHash = user ? user.password : DUMMY_PASSWORD_HASH;
                const passwordMatches = bcrypt.compareSync(password, storedHash);

                if (user && passwordMatches) {
                    if (user.used_quota < QUOTA_MAX_ATTEMPTS) {
                        return this.onAuthSuccess(user);
                    }
                    return Promise.reject(new Error('AUTH_FAILED'));
                }

                if (user) {
                    return this.recordAuthFailure(user.login)
                        .then(() => Promise.reject(new Error('AUTH_FAILED')));
                }

                return Promise.reject(new Error('AUTH_FAILED'));
            });
    }

    findUserForLogin(username) {
        const sql = `select login, used_quota, date_quota, password from ${userTable} where login = ?`;
        return new Promise((resolve, reject) => {
            this.con.query(sql, [username], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.length > 0 ? result[0] : null);
                }
            });
        });
    }

    recordAuthFailure(username) {
        const sql = `update ${userTable} set used_quota = used_quota + 1, date_quota = curdate() where login = ?`;
        return new Promise((resolve, reject) => {
            this.con.query(sql, [username], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    onAuthSuccess(user) {
        const sql = `
            update ${userTable}
            set used_quota = case
                when date_quota is null then used_quota
                when datediff(curdate(), date_quota) > ? then 0
                else used_quota
            end
            where login = ?`;
        return new Promise((resolve, reject) => {
            this.con.query(sql, [QUOTA_RESET_AFTER_DAYS, user.login], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    insertUser(login, password) {
        return new Promise((resolve, reject) => {
            this.con.query(`insert into ${userTable}(login, password, date_quota) values(?, ?, null)`, [login, bcrypt.hashSync(password, 10)],
                (error, _results, _fields) => this.manageTransaction(this.con, error, resolve, reject));
        });
    }

    /***** UTILS *******/
    manageTransaction(connection, error, resolve, reject) {
        if (error) {
            connection.rollback(() => {
                reject(error.sqlMessage ? error.sqlMessage : error);
            });
        } else {
            connection.commit((err) => {
                if (err) {
                    connection.rollback(() => {
                        reject(err.sqlMessage ? err.sqlMessage : err);
                    });
                }
                resolve();
            });
        }
    }
}
module.exports = Data;
