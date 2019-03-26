const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const config = require('./config');
const mysql = require('mysql');
let con = mysql.createConnection(config.datasource);
const Data = require('./data');
const Jwt = require('./jwt');
const jwt = new Jwt();

app.use(bodyParser.json());
app.use(cors());

con.connect((err) => {
    if (err) {
        const message = 'Impossible de se connecter à la base de données';
        console.error(message);
        app.get('/*', (_req, res) => {
            con = mysql.createConnection(config.datasource);
            con.connect((err) => {
                if (err) {
                    res.status(500).json({ message });
                } else {
                    console.info("Connected to database after 1 get retry!");
                    app.data = new Data(con);
                    routes(app);
                }
            });
        }).post('/*', (_req, res) => {
            con = mysql.createConnection(config.datasource);
            con.connect((err) => {
                if (err) {
                    res.status(500).json({ message });
                } else {
                    console.info("Connected to database after 1 post retry!");
                    app.data = new Data(con);
                    routes(app);
                }
            });
        });
    } else {
        console.info("Connected to database!");
        app.data = new Data(con);
        routes(app);
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

//
// ROUTES
//

routes = (application) => {

    /***** RESTFUL PASSWORD API*****/
    application.get('/password', (req, res) => {
        const currentUser = jwt.check(req.get('Authorization'));
        if (currentUser) {
            application.data.find(currentUser, req.query.search)
                .then(result => res.json(result))
                .catch(err => {
                    console.error(err);
                    res.status(500).send({ message: 'Une erreur s\'est produite' });
                });
        } else {
            res.status(401).json({ message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette opération' })
        }
    });

    application.put('/password', (req, res) => {
        const currentUser = jwt.check(req.get('Authorization'));
        if (currentUser) {
            application.data.findByAccountId(currentUser, req.body.id)
                .then(existingObject => {
                    if (existingObject) {
                        const newObject = { ...existingObject, ...req.body };
                        application.data.updateAccountAndSite(currentUser, newObject)
                            .then(() => res.status(200).send({ message: 'OK' }))
                            .catch(err => { 
                                console.error(err);
                                res.status(500).send({ message: 'Une erreur s\'est produite' }) ;
                            });
                    } else {
                        res.status(400).send({ message: 'Ce compte est introuvable' });
                    }
                })
                .catch(err => { 
                    console.error(err); 
                    res.status(500).send({ message: 'Une erreur s\'est produite' }); 
                });
        } else {
            res.status(401).json({ message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette opération' })
        }
    });

    application.post('/password', (req, res) => {
        const currentUser = jwt.check(req.get('Authorization'));
        if (currentUser) {
            application.data.findBySiteName(currentUser, req.body.name)
                .then(existingSites => {
                    if (existingSites.length > 0) {
                        let accountExists = false;
                        for (existingSite in existingSites) {
                            if (existingSite.accounts 
                                && existingSite.accounts.filter(a => a.username === req.body.username).length > 0) {
                                    accountExists = true;
                                    break;
                            }
                        }
                        if (accountExists) {
                            return res.status(400).send({ message: 'Ce compte existe déjà pour ce site' });
                        } else {                
                            // Create just account
                            application.data.createAccount(currentUser, existingSites[0], req.body)
                                .then(newAccount => res.status(200).send(newAccount))
                                .catch(err => { 
                                    console.error(err);
                                    res.status(500).send({ message: 'Une erreur s\'est produite' }) ;
                                });
                        }
                    } else {
                        // Create site + account
                        application.data.createSite(req.body)
                            .then(newSite => application.data.createAccount(currentUser, newSite, req.body))
                            .then(newAccount => res.status(200).send(newAccount))
                            .catch(err => { 
                                console.error(err);
                                res.status(500).send({ message: 'Une erreur s\'est produite' }) ;
                            });
                    }
                })
                .catch(err => { 
                    console.error(err); 
                    res.status(500).send({ message: 'Une erreur s\'est produite' }); 
                });
        } else {
            res.status(401).json({ message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette opération' })
        }
    });

    application.delete('/password/:id', (req, res) => {
        const currentUser = jwt.check(req.get('Authorization'));
        if (currentUser) {
            application.data.deleteAccount(currentUser, req.params.id)
                .then(() => res.status(200).send({ message: 'OK' }))
                .catch(err => { 
                    console.error(err);
                    res.status(500).send({ message: 'Une erreur s\'est produite' }) ;
                });
        } else {
            res.status(401).json({ message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette opération' })
        }
    });


    /***** AUTHENTICATION API *****/

    application.post('/login', (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(401).json({ message: 'Veuillez saisir un nom d\'utilisateur et un mot de passe' });
        }

        return new Data(con).authentify(req.body.username, req.body.password)
            .then(() => res.json({ token: jwt.generate(req.body.username) }))
            .catch(err => {
                console.error(err);
                return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe erroné' });
            });
    });


}