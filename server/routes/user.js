const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {UserController} = require('../controllers');

router.post('/api/user/check',UserController.check)

router.post("/api/user/files", authMiddleware, UserController.files)

router.patch("/api/user/makePublic/:cid", authMiddleware, UserController.makePublic);

router.patch("/api/user/deleteFile/:cid", authMiddleware, UserController.deleteFile)

router.get("/api/user/getName/:id", UserController.getName)

module.exports = router
