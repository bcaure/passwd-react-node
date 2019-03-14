const bcrypt = require('bcryptjs');

const accountTable = 'compte';
const siteTable = 'site';
const userTable = 'user';
const accountColumns = ['id', 'login', 'mdp', 'id_site', 'user']
const siteColumns = ['id', 'libelle', 'url'];

class Data {

    constructor(con) {
        if (!con) {
            throw Error('connection required');
        }
        this.con = con;
    }
    
    find(username, searchTerm) {
        const accountColumnsAlias = accountColumns.map(column => `${accountTable}.${column}`).join(', ');
        const siteColumnsAlias = siteColumns.map(column => `${siteTable}.${column}`).join(', ');
        const sql = `
        SELECT DISTINCT ${accountColumnsAlias}, ${siteColumnsAlias}
        FROM ${accountTable} 
        INNER JOIN ${siteTable} ON ${siteTable}.id = ${accountTable}.id_site 
        INNER JOIN ${userTable} ON ${userTable}.login = ${accountTable}.user
        WHERE user = ? ${ searchTerm ? 'AND (login like ? OR libelle like ? OR url like ?)' : ''}`;

        let params = [username];
        if (searchTerm) {
            params = [...params, searchTerm, searchTerm, searchTerm];
        }

        return new Promise((resolve, reject) => {
            console.log(sql, params);
            this.con.query(sql, params, (err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(result.map(res => this.mapToObject(res)));
                }
            });
        });
    };

    mapToObject(tableRow) {
        return {
            url: tableRow.url,
            name: tableRow.libelle,
            username: tableRow.login,
            password: tableRow.mdp
        };
    }

    mapToTableRow(object) {

    }

    authentify(username, password) {

        return this.checkAuthQuota(username)
            .then(user => this.checkPassword(username, user.password, password))
            .catch(error => this.updateAuthQuota(username, error));

    }

    checkAuthQuota(username) {
        const queryQuota = 'select login, used_quota, password from user where login = ? ';
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    if (result && result.length > 0) {
                        if (result[0].used_quota < 10) {
                            resolve(result[0]);
                        } else {
                            reject('Quota exceeded for '+username);
                        }
                    } else {
                        reject('Unknown user: '+username);
                    }
                }
            });
        });
    }
    
    updateAuthQuota(username, initialError) {
        const queryQuota = 'update user set used_quota= used_quota + 1 where login = ?';
        return new Promise((resolve, reject) => {
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
                reject('wrong password for '+username);
            } else {
                resolve();
            }

        });
    }
    
    insertUser(login, password) {
        return new Promise((resolve, reject) => {
            this.con.query('insert into `user`(login, password, date_quota) values(?, ?, ?)', [ login, bcrypt.hashSync(password, 10), new Date() ], 
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
