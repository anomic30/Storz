const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const AppError = require('../config/appError.config')

const { Magic } = require('@magic-sdk/admin');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user')

const magic = new Magic(process.env.MAGIC_SECRET_KEY);
router.post('/api/user/login', async (req, res, next) => {

    const didToken = req.headers.authorization.substring(7);
    await magic.token.validate(didToken);

    return res.status(200).json({ authenticated: true });
});

router.post('/api/user/create', authMiddleware, async (req, res) => {
    const magic_id = req.body.magic_id;
    const user_name = req.body.user_name;
    const email = req.body.email;

    if (!user_name || !magic_id || !email) {
        res.status(400).send({
            success: false,
            message: 'Missing required fields'
        })
    }

    let user = await User.findOne({ magic_id: magic_id });
    if (user) {
        console.log("User already exists!")
        return res.status(200).json({ success: false, message: "User already exists" });
    }
    
    const encryption_key = uuidv4();
    user = new User({ magic_id, email, user_name, encryption_key, files: [] })
    
    await user.save();
    return res.status(200).json({ success: true, message: "User created successfully" });
})

module.exports = router