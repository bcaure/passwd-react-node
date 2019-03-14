
const jsonwebtoken = require('jsonwebtoken');
const config = require('./config');

class Jwt {
    check(token) {
        try {
            const decoded = jsonwebtoken.verify(token, config.secret);
            return decoded.id;
        } catch (err) {
            return null;
        }
    }

    generate(username) {
        return jsonwebtoken.sign({ id: username }, config.secret, { expiresIn: 3600 });// expires in 1 hour
    }
}
module.exports = Jwt;
