const router = require("express").Router();

const {DownloadController} = require('../controllers')

router.get("/api/download/secure/:cid/:auth", DownloadController.secureDownload)

router.get("/api/download/:cid", DownloadController.download)

module.exports = router
