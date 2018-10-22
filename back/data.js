const accountTable = 'compte';
const siteTable = 'site';
const userTable = 'user';
const accountColumns = ['id', 'login', 'mdp', 'id_site', 'user']
const siteColumns = ['id', 'libelle', 'url'];

class Data {

    constructor(con) {
        this.con = con;
    }
    
    find(criteria) {
        const accountColumnsAlias = accountColumns.map(column => `${accountTable}.${column}`).join(', ');
        const siteColumnsAlias = siteColumns.map(column => `${siteTable}.${column}`).join(', ');
        const whereClause = '';
        if (criteria) {
            whereClause = `
            WHERE (login IS NULL OR login like ?)
            AND (libelle IS NULL OR libelle like ?)
            AND (url IS NULL OR url like ?)`;
        }
        const sql = `
        SELECT DISTINCT ${accountColumnsAlias}, ${siteColumnsAlias}
        FROM ${accountTable} 
        INNER JOIN ${siteTable} ON ${siteTable}.id = ${accountTable}.id_site 
        INNER JOIN ${userTable} ON ${userTable}.login = ${accountTable}.user
        ${whereClause}`;

        return new Promise((resolve, reject) => {
            this.con.query(sql, [criteria, criteria, criteria], (err, result) => {
                if (err) {
                    console.error(err);
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
            .then(() => this.checkPassword(username, password))
            .catch(() => this.updateAuthQuota(username));

    }

    checkAuthQuota(username) {
        const queryQuota = 'select used_quota from user where login = ? ';
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username], (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                } else {
                    if (result && result.length > 0) {
                        if (result[0].used_quota < 10) {
                            resolve();
                        }
                    } else {
                        return reject('Quota exceeded');
                    }
                }
            });
        });
    }
    
    updateAuthQuota(username) {
        const queryQuota = 'update user set used_quota= used_quota + 1 where login = ?';
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username], (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    checkPassword(username, password) {
        const queryQuota = 'select * from user where login = ? and password = ?';
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username, password], (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                } else {
                    if (result && result.length > 0) {
                        resolve();
                    } else {
                        return reject('Authentication failed');
                    }
                }
            });
        });
    }
    
}
module.exports = Data;
