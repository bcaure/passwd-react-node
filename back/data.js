const accountTable = 'compte';
const siteTable = 'site';
const userTable = 'user';
const accountColumns = ['id', 'login', 'mdp', 'id_site', 'user']
const siteColumns = ['id', 'libelle', 'url'];

class Data {

    constructor(con) {
        this.con = con;
    }
    
    find(criteria, success, error) {
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

        var it = this;
        return this.con.query(sql, [criteria, criteria, criteria], function (err, result) {
            if (err) {
                error(err);
            } else {
                success(result.map(res => it.mapToObject(res)));
            }
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
}
module.exports = Data;
