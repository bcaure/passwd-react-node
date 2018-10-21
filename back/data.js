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

        return new Promise(function(resolve, reject) {
            this.con.query(sql, [criteria, criteria, criteria], function (err, result) {
                if (err) {
                    return reject(err);
                } else {
                    resolve(result.map(res => it.mapToObject(res)));
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
            .then(() => {

            });

        // $stmt->bindValue(':nom', $user, PDO::PARAM_STR);
        // $stmt->execute();
        // if ($stmt->rowCount() <= 0) {
        //     return false;
        // } else if ($stmt->fetchColumn() >= 10) {
        //     return false;	
        // } else {
        
        //     $stmt = $db->prepare("select * from user where login = :nom and password = :password");
        //     $stmt->bindValue(':nom', $user, PDO::PARAM_STR);
        //     $stmt->bindValue(':password', $password, PDO::PARAM_STR);
        //     $stmt->execute();
        //     if ($stmt->rowCount() > 0) {
        //         return true;
        //     } else {
        //         $stmt = $db->prepare("update user set used_quota= used_quota + 1 where login = :nom");
        //         $stmt->bindValue(':nom', $user, PDO::PARAM_STR);
        //         $stmt->execute();
        //         return false;
        //     }
        // }
    }

    checkAuthQuota(username) {
        const queryQuota = 'select used_quota from user where login = ? ';
        return new Promise((resolve, reject) => {
            this.con.query(queryQuota, [username], function (err, result) {
                if (err) {
                    return reject(err);
                } else {
                    if (result && result.length > 0) {
                        if (result[0].used_quota < 10) {
                            resolve();
                    } else {
                        return reject('Quota exceeded');
                    }
                }
            });
        });
    }
}
module.exports = Data;
