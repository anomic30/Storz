
const sendErrorDev = (err, req, res) => {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
};

const sendErrorProd = (err, req, res) => {

    if (err.status === 'fail') {
        // A) Operational, trusted error: send message to client
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else{
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
        status: 'error',
        message: 'Something went very very wrong!'
        });
    }
    
  
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  console.log( err.status)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'dev') {
    sendErrorDev(err, req, res);
  } 
  else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, req, res);
  }
};
