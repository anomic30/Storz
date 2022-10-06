const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const AppError = require('../config/appError.config')
const User = require('../models/user')
const { Magic } = require('@magic-sdk/admin');
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

router.post('/api/user/check', async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
        return res.status(200).json({
            message: "user_found"
        });
    }

    throw new AppError("user_not_found" , 200);
    
})


router.post("/api/user/files", authMiddleware, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const user = await User.findOne({ magic_id: magic_id });

    if (!user) {
        return res.status(400).send({
            success: false,
            message: 'user_not_found'
        }) 
    }

    const files = user.files;
    return res.status(200).json({ files: files, owner: user.user_name });
})

router.patch("/api/user/makePublic/:cid", authMiddleware, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const cid = req.params.cid;
    const state = req.body.state;
    if (!magic_id || !cid) {
        return res.status(400).send({
            success: false,
            message: 'Missing required fields'
        });
    }

    await User.updateOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { $set: { 'files.$.public': state } });
    return res.status(200).json({ 
        success: true,
        message: "File visibility updated successfully!"
     });
});

router.patch("/api/user/deleteFile/:cid", authMiddleware, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const cid = req.params.cid;

    if (!magic_id || !cid) {
        return res.status(400).send({
            success: false,
            message: 'Missing required fields'
        })
    }

    await User.updateOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { $pull: { files: { cid: cid } } });
    return res.status(200).json({ success: true, message: "File deleted successfully!" });
})

router.get("/api/user/getName/:id", async (req, res) => {
    const magic_id = req.params.id;
    if (!magic_id) {
        return res.status(400).send({
            success: false,
            message: 'Missing required fields'
        })
    }

    const user = await User.findOne({ magic_id: magic_id }, { user_name: 1 });

    // Changing below line to: res.status(200).send({ success: true, message: 'some message', data: user })
    // would cause a breaking change ...
    // this line was intentionally left this way until it is determined we are ready for the breaking change
    res.status(200).json(user);

})

module.exports = router
