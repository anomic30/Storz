const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');

exports.SanitizeMongoData = mongoSantize();
exports.RemoveHTMLTags = xss();
