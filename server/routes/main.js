const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('Welcome to Storz API v1.0!');
});

module.exports = router;
