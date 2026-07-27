const rateLimit = require('express-rate-limit');

const LOGIN_RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 60_000);
const LOGIN_RATE_LIMIT_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX || 10);

const loginRateLimiter = rateLimit({
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
    max: LOGIN_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
    }
});

module.exports = loginRateLimiter;
