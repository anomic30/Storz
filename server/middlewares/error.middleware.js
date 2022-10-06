
// const logger = require('../config/logging.config')
const logger = require('../config/logging.config')
const { SDKError, ErrorCode } = require('@magic-sdk/admin');
const {  } = require('@magic-sdk');

const { NODE_ENV } = process.env
/**
This is not used yet
const handleMagicLinkError = (error) => {
	// Depending on the error we can decide serialise, show, hide the info from the client
	if (error instanceof SDKError) {
    // Handle...
  }
}
*/

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