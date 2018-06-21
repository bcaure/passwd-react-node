const express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

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

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "OPTIONS,GET,DELETE,PUT,POST");
    res.header("")
    next();
});

app.listen(3001, function() {
    console.log('listening on 3001')
});

/***** RESTFUL PASSWORD API*****/
app.get('/password', (req, res) => {
    res.json(data);
});


app.get('/password/:name', (req, res) => {
    res.json(data.find(item => item.name === req.params.name));
});

app.put('/password', (req, res) => {
    console.log(req.body);
    const idx = data.findIndex(item => item.name === req.body.name);
    if (idx) {
        data[idx] = req.body;
        res.sendStatus(200);
    } else {
        res.status(400).send({msg: 'item name not found'});
    }
});

app.post('/password', (req, res) => {
    const idx = data.findIndex(item => item.name === req.body.name);
    if (idx) {
        res.status(400).send({msg: 'item name already exists'});
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
        res.status(400).send({msg: 'item name not found'});
    }
});


/***** AUTHENTICATION API *****/
app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send({msg: 'missing params'});
    }

    const passwordIsValid = true;//bcrypt.compareSync(req.body.password, 'p');
    if (!passwordIsValid) {
        return res.status(401).send({msg: 'not authorized'});
    }
    var token = jwt.sign({ id: req.body.username }, config.secret, { expiresIn: 3600 });// expires in 24 hours 
    res.status(200).send({ auth: true, token: token });

});
