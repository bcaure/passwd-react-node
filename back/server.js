const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const mysql = require('mysql');
const config = require('./config');
const con = mysql.createConnection(config.datasource);
var Data = require('./data');

app.use(bodyParser.json());
app.use(cors());

con.connect((err) => {
    if (err) {
        const message = 'Cannot connect to database';
        console.error(message);
        app.get('/*', (_req, res) => {
            con.connect((err) => {
                if (err) {
                    res.status(500).json({message});
                } else {
                    console.info("Connected to database!");
                    routes(app);
                }
            });
        }).post('/*', (_req, res) => {
            con.connect((err) => {
                if (err) {
                    res.status(500).json({message});
                } else {
                    console.info("Connected to database!");
                    routes(app);
                }
            });
        });
    } else {
        console.info("Connected to database!");
        routes(app);
    }
});

app.listen(3001, () => {
    console.log('listening on 3001')
});

//
// ROUTES
//

routes = (application) => {
    /***** RESTFUL PASSWORD API*****/
    application.get('/password',
        (req, res) => {
            new Data(con).find(req.criteria)
                .then(result => res.json(result))
                .catch(err => res.status(500).send({ message: err }));
        })
    application.put('/password', (req, res) => {
        console.log(req.body);
        const idx = data.findIndex(item => item.name === req.body.name);
        if (idx) {
            data[idx] = req.body;
            res.sendStatus(200);
        } else {
            res.status(400).send({ message: 'item name not found' });
        }
    })
    application.post('/password', (req, res) => {
        const idx = data.findIndex(item => item.name === req.body.name);
        if (idx) {
            res.status(400).send({ message: 'item name already exists' });
        } else {
            data.push(req.body);
            res.sendStatus(200);
        }
    });

    application.delete('/password/:name', (req, res) => {
        const idx = data.findIndex(item => item.name === req.body.name);
        if (idx) {
            data = data.splice(idx, 1);
            res.sendStatus(200);
        } else {
            res.status(400).send({ message: 'item name not found' });
        }
    })
    application.get('/password/:name', (req, res) => {
        res.json(data.find(item => item.name === req.params.name));
    });



    /***** AUTHENTICATION API *****/

    application.post('/login', (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(401).json({ message: 'wrong credentials' });
        }

        const passwordIsValid = true;//bcrypt.compareSync(req.body.password, 'p');
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'wrong credentials' });
        }
        var token = jwt.sign({ id: req.body.username }, config.secret, { expiresIn: 3600 });// expires in 1 hour
        res.json({ token });

    });
}