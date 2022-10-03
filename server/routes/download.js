const router = require("express").Router();

const {FileController} = require('../controllers')

router.get("/api/download/secure/:cid/:auth", FileController.secureDownload)

router.get("/api/download/:cid", FileController.download)

module.exports = router
