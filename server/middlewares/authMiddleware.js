const { Magic } = require('@magic-sdk/admin');
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const authMiddleware = async (req, res, next) => {
    const didToken = req.headers.authorization.substring(7);
    await magic.token.validate(didToken);
    next();
}

module.exports = authMiddleware;