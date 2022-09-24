const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {AuthController} = require('../controllers')


router.post('/api/user/login', AuthController.login);

router.post('/api/user/create', authMiddleware, AuthController.create)

module.exports = router