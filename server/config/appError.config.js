
class AppError extends Error {
	constructor(message, statusCode = 500) {
		super(message);
		this.name = 'Stors';
		this.statusCode = statusCode;
		// this.isOperational = true;
		this.date = new Date();

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

module.exports = AppError
