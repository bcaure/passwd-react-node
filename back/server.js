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
        const username = jwt.check(req.get('Authorization'));
        if (username) {
            application.data.find(username, req.criteria)
                .then(result => res.json(result))
                .catch(err => res.status(500).send({ message: err }));
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });

    application.put('/password', (req, res) => {
        if (jwt.check(req.get('Authorization'))) {
            const idx = data.findIndex(item => item.name === req.body.name);
            if (idx) {
                data[idx] = req.body;
                res.sendStatus(200);
            } else {
                res.status(400).send({ message: 'item name not found' });
            }
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });

    application.post('/password', (req, res) => {
        if (jwt.check(req.get('Authorization'))) {
            const idx = data.findIndex(item => item.name === req.body.name);
            if (idx) {
                res.status(400).send({ message: 'item name already exists' });
            } else {
                data.push(req.body);
                res.sendStatus(200);
            }
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });

    application.delete('/password/:name', (req, res) => {
        if (jwt.check(req.get('Authorization'))) {
            const idx = data.findIndex(item => item.name === req.body.name);
            if (idx) {
                data = data.splice(idx, 1);
                res.sendStatus(200);
            } else {
                res.status(400).send({ message: 'item name not found' });
            }
        } else {
            res.status(401).json({ message: 'wrong credentials' })
        }
    });

    application.get('/password/:name', (req, res) => {
        const username = jwt.check(req.get('Authorization'));
        if (username) {
            res.json(data.find(item => item.name === req.params.name));
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