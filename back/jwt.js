
const jsonwebtoken = require('jsonwebtoken');

class Jwt {
    check(token) {
        try {
            const decoded = jsonwebtoken.verify(token, process.env.SECRET);
            return decoded.id;
        } catch (err) {
            return null;
        }
    }

    generate(username) {
        return jsonwebtoken.sign({ id: username }, process.env.SECRET, { expiresIn: 3600 });// expires in 1 hour
    }
}
module.exports = Jwt;
