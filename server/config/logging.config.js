
const winston = require('winston');
const NODE_ENV = process.env

const { combine, timestamp, prettyPrint } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    prettyPrint()
  ),

  transports: [
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
      json: true,
      // 5 MB
      maxsize: 5242880, // Max size in bytes of the logfile, if the size is exceeded then a new file is created,
      colorize: true
    })
  ],
  exitOnError: false
});

// Handle uncaught exceptions and rejections
const transportOptions = {
  filename: 'logs/exceptions.rejections.log',
  json: true,
  maxsize: 5242880,
  exitOnError: false
};
logger.exceptions.handle(new winston.transports.File(transportOptions));
logger.rejections.handle(new winston.transports.File(transportOptions));

//
// If we're not in production then log to the `console`
//
if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.prettyPrint()
    )
  }));
}

module.exports = logger;
