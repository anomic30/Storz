const router = require('express').Router();
const { Magic } = require('@magic-sdk/admin');
const authMiddleware = require('../middlewares/authMiddleware');
const AppError = require('../util/appError');
const User = require('../models/user');

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

router.post('/api/user/check', async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(200).json({
      message: 'user_found'
    });
  }
  return next(new AppError('user_not_found', 200));
});

router.post('/api/user/files', authMiddleware, async (req, res, next) => {
  const metadata = await magic.users.getMetadataByToken(
    req.headers.authorization.substring(7)
  );
  const magic_id = metadata.issuer;
  const user = await User.findOne({ magic_id });
  if (!user) {
    return next(new AppError('user_not_found', 400));
  }
  const { files } = user;
  return res.status(200).json({ files, owner: user.user_name });
});

router.patch(
  '/api/user/makePublic/:cid',
  authMiddleware,
  async (req, res, next) => {
    const metadata = await magic.users.getMetadataByToken(
      req.headers.authorization.substring(7)
    );
    const magic_id = metadata.issuer;
    const { cid } = req.params;
    const { state } = req.body;
    if (!magic_id || !cid) {
      return next(new AppError('Missing required fields', 400));
    }
    try {
      await User.updateOne(
        { magic_id, files: { $elemMatch: { cid } } },
        { $set: { 'files.$.public': state } }
      );
      return res
        .status(200)
        .json({ message: 'File visibility updated successfully!' });
    } catch (err) {
      // return res.status(500).json({ error: err.message, message: "File visibility update failed!" });
      return next(new AppError('File visibility update failed!', 500));
    }
  }
);

router.patch(
  '/api/user/deleteFile/:cid',
  authMiddleware,
  async (req, res, next) => {
    console.log('Delete route called!');
    const metadata = await magic.users.getMetadataByToken(
      req.headers.authorization.substring(7)
    );
    const magic_id = metadata.issuer;
    const { cid } = req.params;
    if (!magic_id || !cid) {
      return next(new AppError('Missing required fields', 400));
    }
    try {
      await User.updateOne(
        { magic_id, files: { $elemMatch: { cid } } },
        { $pull: { files: { cid } } }
      );
      return res.status(200).json({ message: 'File deleted successfully!' });
    } catch (err) {
      // return res.status(500).json({ error: err.message, message: "File deletion failed!" });
      return next(new AppError('File deletion failed!', 500));
    }
  }
);

router.get('/api/user/getName/:id', async (req, res, next) => {
  const magic_id = req.params.id;
  if (!magic_id) {
    return next(new AppError('Missing required fields', 400));
  }
  try {
    const user = await User.findOne({ magic_id }, { user_name: 1 });
    return res.status(200).json(user);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

module.exports = router;
