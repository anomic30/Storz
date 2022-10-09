const { Magic } = require('@magic-sdk/admin');
const AppError = require('../util/appError');

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const authMiddleware = async (req, res, next) => {
  try {
    const didToken = req.headers.authorization.substring(7);
    await magic.token.validate(didToken);
    next();
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

module.exports = authMiddleware;
