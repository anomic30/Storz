const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {FileController} = require('../controllers')

router.post("/api/upload", authMiddleware, FileController.upload)

module.exports = router