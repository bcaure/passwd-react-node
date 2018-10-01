const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const mysql = require('mysql');
const config = require('./config');
const con = mysql.createConnection(config.datasource);

con.connect((err) => {
    if (err) {
        console.error('Cannot connect to database');
        throw err;
    }
    console.info("Connected to database!");
});

app.use(bodyParser.json());
app.use(cors());

const data = [
    {
        url: 'https://google.com',
        username: 'ben',
        password: 'rezzsdsffd',
        name: 'Google'
    },
    {
        url: 'https://facebook.com',
        username: 'ben@ben.com',
        password: 'dsxxv',
        name: 'Facebook'
    },
    {
        url: 'https://twitter.com',
        username: 'ben@ben.com',
        password: 'dddddssss',
        name: 'Twitter'
    },
    {
        url: 'https://pinterest.com',
        username: 'ben@tutu.com',
        password: 'azzoodd',
        name: 'Pinterest'
    }
];



app.listen(3001, () => {
    console.log('listening on 3001')
});

/***** RESTFUL PASSWORD API*****/
app.get('/password',
    (req, res) => {
        res.json(data);
    })
app.put('/password', (req, res) => {
    console.log(req.body);
    const idx = data.findIndex(item => item.name === req.body.name);
    if (idx) {
        data[idx] = req.body;
        res.sendStatus(200);
    } else {
        res.status(400).send({ msg: 'item name not found' });
    }
})
app.post('/password', (req, res) => {
    const idx = data.findIndex(item => item.name === req.body.name);
    if (idx) {
        res.status(400).send({ msg: 'item name already exists' });
    } else {
        data.push(req.body);
        res.sendStatus(200);
    }
});

app.delete('/password/:name', (req, res) => {
    const idx = data.findIndex(item => item.name === req.body.name);
    if (idx) {
        data = data.splice(idx, 1);
        res.sendStatus(200);
    } else {
        res.status(400).send({ msg: 'item name not found' });
    }
})
app.get('/password/:name', (req, res) => {
    res.json(data.find(item => item.name === req.params.name));
});



/***** AUTHENTICATION API *****/

app.post('/login', (req, res) => {
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
