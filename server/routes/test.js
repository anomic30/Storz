const authMiddleware = require("../middlewares/authMiddleware");
const router = require("express").Router();

router.post("/test", authMiddleware, (req, res) => {
    return res.status(200).json("User can use secure APIs");
})

module.exports = router
