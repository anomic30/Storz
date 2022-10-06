
// const logger = require('../config/logging.config')
const logger = require('../config/logging.config')
const { SDKError, ErrorCode } = require('@magic-sdk/admin');

const { NODE_ENV } = process.env

/**
 * This handles magic link error
 * @param {Error} error Node Error
 * @param {Response} res Express Response
 * @returns {string} message
 */
const handleMagicLinkError = (error, res) => {
	// Depending on the error we can decide serialise, show, hide the info from the client
	
	const magicErrors = {
		[ErrorCode.MalformedTokenError]: 'The supplied DID Token could not be successfully parsed.',
		[ErrorCode.IncorrectSignerAddress]: 'The supplied DID Token is invalid. Mismatch between the signature origin and the claimed public address',
		[ErrorCode.TokenExpired]: 'The supplied DID Token is invalid or expired',
		[ErrorCode.TokenCannotBeUsedYet]: 'The supplied DID token cannot be used yet',
		[ErrorCode.FailedRecoveryProof]: 'The supplied DID Token could not be recovered'
	}

	const serverError = [
		ErrorCode.ServiceError,
		ErrorCode.FailedRecoveryProof
	]

	let message = magicErrors[error.code]

	if (!message && serverError.includes(error.code)) {
		// this is to make sure we do not retain error not need by the client
		// ServiceError and FailedRecoveryProof seems to be API or server error not caused by the client
		// check: https://magic.link/docs/auth/api-reference/server-side-sdks/node#error-codes
		message = ''
		// log error to file
		logger.error('', error);
	}

	return message
}


const productionResponse = (req, res, data) => {
	const { status, message } = data
	return res.status(status || 500).send({
    success: false,
		message: message ? message : 'Something failed:...'
	});
}

// response meant for other env like development
const otherEnvResponse = (req, res, data) => {
	// other env
	const { status, message } = data
	return res.status(status || 500).send({
		success: false,
		message: `Something failed: ${error.message}`
	});
}

const sendResponse = (error, req, res, next) => {
	const status = error.statusCode
	// production env
	if (NODE_ENV === 'production') {
		return productionResponse(req, res, { status })
	}

	return otherEnvResponse(req, res, { status })
}

const _error = (error, req, res, next) => {
	error.datetime = `${new Date()}`;

	error.requestMeta = `[${req.method}] [${req.protocol}] [${req.hostname}] [${
    req.originalUrl
	}] [${req.get('User-Agent')}] `;
	
	error.statusCode = error.statusCode || 500
	
	if (error instanceof SDKError) {
		error.statusCode = 400
		const magicMessage = handleMagicLinkError(error, res)

		return productionResponse(req, res, { status: error.statusCode, message: magicMessage })
	}
	
	// this logs error to file
	logger.error('', error);

	return sendResponse(error, req, res, next)

};

module.exports = _error