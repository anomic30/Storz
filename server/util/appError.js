class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    if (statusCode === 500) this.status = 'error';
    else this.status = 'fail';
    Error.captureStackTrace(this, this.constrctor);
  }
}

module.exports = AppError;
