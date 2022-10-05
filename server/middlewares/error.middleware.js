
// const logger = require('../config/logging.config')
const logger = require('../config/logging.config')
const { NODE_ENV } = process.env

const _error = (error, req, res, next) => {
	error.datetime = `${new Date()}`;

	error.requestMeta = `[${req.method}] [${req.protocol}] [${req.hostname}] [${
    req.originalUrl
	}] [${req.get('User-Agent')}] `;

	logger.error('', error);

  const status = error.statusCode || 500
  
	if (NODE_ENV === 'development' || !NODE_ENV) {
    return res.status(status).send({
      success: false,
			message: `Something failed: ${error.message}`
		});
	}
  
	// any other env
	return res.status(status).send({
    success: false,
		message: 'Something failed:...'
	});
};

module.exports = _error