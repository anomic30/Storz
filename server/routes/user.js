const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authenticate=require("../middlewares/authenticate")
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
    } else {
        return res.status(200).json({
            message: "user_not_found"
        });
    }
})


router.post("/api/user/files", authenticate, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const user = await User.findOne({ magic_id: magic_id });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
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
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        await User.updateOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { $set: { 'files.$.public': state } });
        return res.status(200).json({ message: "File visibility updated successfully!" });
    } catch (err) {
        return res.status(500).json({ error: err.message, message: "File visibility update failed!" });
    }
});

router.patch("/api/user/deleteFile/:cid", authMiddleware, async (req, res) => {
    console.log("Delete route called!")
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const cid = req.params.cid;
    if (!magic_id || !cid) {
        return res.status(400).json({ error: "Server Error" });
    }
    try {
        await User.updateOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { $pull: { files: { cid: cid } } });
        return res.status(200).json({ message: "File deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ error: err.message, message: "File deletion failed!" });
    }
})

router.get("/api/user/getName/:id", async (req, res) => {
    const magic_id = req.params.id;
    if (!magic_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const user = await User.findOne({ magic_id: magic_id }, { user_name: 1 });
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

module.exports = router
