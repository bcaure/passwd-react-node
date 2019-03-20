const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const config = require('./config');
const mysql = require('mysql');
const con = mysql.createConnection(config.datasource);
const Data = require('./data');
const Jwt = require('./jwt');
const jwt = new Jwt();

app.use(bodyParser.json());
app.use(cors());

con.connect((err) => {
    if (err) {
        const message = 'Cannot connect to database';
        console.error(message);
        app.get('/*', (_req, res) => {
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
                    res.status(500).send({ message: 'problem occured' });
                });
        } else {
            res.status(401).json({ message: 'wrong credentials' })
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
                                res.status(500).send({ message: 'problem occured' }) ;
                            });
                    } else {
                        res.status(400).send({ message: 'item name not found' });
                    }
                })
                .catch(err => { 
                    console.error(err); 
                    res.status(500).send({ message: 'problem occured' }); 
                });
        } else {
            res.status(401).json({ message: 'wrong credentials' })
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
                            return res.status(400).send({ message: 'account already exists for this site' });
                        } else {                
                            // Create just account
                            application.data.createAccount(currentUser, existingSites[0], req.body)
                                .then(newAccount => res.status(200).send(newAccount))
                                .catch(err => { 
                                    console.error(err);
                                    res.status(500).send({ message: 'problem occured' }) ;
                                });
                        }
                    } else {
                        // Create site + account
                        application.data.createSite(req.body)
                            .then(newSite => application.data.createAccount(currentUser, newSite, req.body))
                            .then(newAccount => res.status(200).send(newAccount))
                            .catch(err => { 
                                console.error(err);
                                res.status(500).send({ message: 'problem occured' }) ;
                            });
                    }
                })
                .catch(err => { 
                    console.error(err); 
                    res.status(500).send({ message: 'problem occured' }); 
                });
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });

    application.delete('/password/:id', (req, res) => {
        const currentUser = jwt.check(req.get('Authorization'));
        if (currentUser) {
            application.data.deleteAccount(currentUser, req.params.id)
                .then(() => res.status(200).send({ message: 'OK' }))
                .catch(err => { 
                    console.error(err);
                    res.status(500).send({ message: 'problem occured' }) ;
                });
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });


    /***** AUTHENTICATION API *****/

    application.post('/login', (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(401).json({ message: 'wrong credentials' });
        }

        return new Data(con).authentify(req.body.username, req.body.password)
            .then(() => res.json({ token: jwt.generate(req.body.username) }))
            .catch(err => {
                console.error(err);
                return res.status(401).json({ message: 'wrong credentials' });
            });
    });


}