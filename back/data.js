const bcrypt = require('bcryptjs');

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
        WHERE user = ? ${ searchTerm ? 'AND (login like ? OR libelle like ? OR url like ?)' : ''}`;

        let params = [currentUser];
        if (searchTerm) {
            params = [...params, searchTerm, searchTerm, searchTerm];
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
            password: tableRow.mdp
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
            mdp: object.password
        };
    }

    authentify(username, password) {

        return this.checkAuthQuota(username)
            .then(user => this.checkPassword(username, user.password, password))
            .catch(error => this.updateAuthQuota(username, error));

    }

    checkAuthQuota(username) {
        const queryQuota = `select login, used_quota, password from ${userTable} where login = ? `;
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    if (result && result.length > 0) {
                        if (result[0].used_quota < 50) {
                            resolve(result[0]);
                        } else {
                            reject('Quota exceeded for ' + username);
                        }
                    } else {
                        reject('Unknown user: ' + username);
                    }
                }
            });
        });
    }

    updateAuthQuota(username, initialError) {
        const queryQuota = `update ${userTable} set used_quota= used_quota + 1 where login = ?`;
        return new Promise((_resolve, reject) => {
            this.con.query(queryQuota, [username], (err, _result) => {
                if (err) {
                    reject(err);
                } else {
                    reject(initialError);
                }
            });
        });
    }

    checkPassword(username, realPassword, givenPassword) {
        return new Promise((resolve, reject) => {

            if (!bcrypt.compareSync(givenPassword, realPassword)) {
                reject('wrong password for ' + username);
            } else {
                resolve();
            }

        });
    }

    insertUser(login, password) {
        return new Promise((resolve, reject) => {
            this.con.query(`insert into ${userTable}(login, password, date_quota) values(?, ?, ?)`, [login, bcrypt.hashSync(password, 10), new Date()],
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
