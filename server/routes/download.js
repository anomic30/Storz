const router = require("express").Router();
const { fs, readFileSync, createWriteStream, unlink, readdirSync, rmSync, unlinkSync } = require('fs');
const jscrypt = require('jscrypt');
const { Magic } = require('@magic-sdk/admin');
const User = require('../models/user')
const { create } = require("ipfs-http-client");
const path = require('path');
const AppError = require("../config/appError.config");
const logger = require('pino')()

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');


async function ipfsClient() {
    const ipfs = await create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            headers: {
                authorization: auth,
            },
        }
    );
    return ipfs;
}

async function getFile(cid, encryptedPath) {
    const ipfs = await ipfsClient();
    const asyncitr = ipfs.cat(cid);

    //create a file under public folder and write the data to it
    const file = createWriteStream(encryptedPath);
    //iterate the async iterator
    for await (const chunk of asyncitr) {
        file.write(chunk);
    }
}


router.get("/secure/:cid/:auth", async (req, res, next) => {
    console.log("Secure download called");
    const cid = req.params.cid;
    const auth = req.params.auth;
    const metadata = await magic.users.getMetadataByToken(auth);
    const magic_id = metadata.issuer;

    const file = await User.findOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { encryption_key: 1 }).select({ files: { $elemMatch: { cid: cid } } });
    // return error as quickly as possible to keep the code base flat as possible you can, instead of nested
    if (!file) {
        return res.status(200).sendFile("../private/hacker.png", { root: __dirname });
    }

    const fileName = file.files[0].file_name;
    const encryptedPath = '../server/private/' + fileName;
    const decryptedPath = '../server/public/' + fileName;

    await getFile(cid, encryptedPath);

    jscrypt.decryptFile(
        encryptedPath,
        decryptedPath,
        "aes256",
        file.encryption_key,
        655000,
        (isDone) => {
            if (isDone === true) {
                console.log(fileName + ' is decrypted successfully!');
                console.log("Sending files to the user");
                //send the file to the client
                res.sendFile(path.resolve(decryptedPath));

                // this should be queued
                setTimeout(() => {
                    unlink(decryptedPath, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                        logger.info(decryptedPath + ' is deleted!');
                    })

                    unlink(encryptedPath, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                        logger.info(encryptedPath + ' is deleted!');
                    })
                }, 2 * 60 * 1000)

            }
            else {
                logger.info("File decryption in progress...");
            }
        }
    )
})

router.get("/:cid", async (req, res,next) => {
    const cid = req.params.cid;

    const file = await User
    .findOne({ files: { $elemMatch: { cid: cid, public: true } } }, { encryption_key: 1 })
    .select({ files: { $elemMatch: { cid: cid, public: true } } });

    if (!file) {
        return res.status(200).sendFile("../private/hacker.png", { root: __dirname });
    }

        const fileName = file.files[0].file_name;
        const encryptedPath = '../server/encrypted/' + fileName;
        const decryptedPath = '../server/public/' + fileName;

        await getFile(cid, encryptedPath)

    jscrypt.decryptFile(
        encryptedPath,
        decryptedPath,
        "aes256",
        file.encryption_key,
        655000,
        (isDone) => {
            if (isDone === true) {
                console.log(fileName + ' is decrypted successfully!');
                console.log("Sending files to the user");
                //send the file to the client
                res.sendFile(path.resolve(decryptedPath));

                // since this occur above and now here, it can be extracted into function and reuse
                setTimeout(() => {
                    unlink(decryptedPath, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                        logger.info(decryptedPath + ' is deleted!');
                    })

                    unlink(encryptedPath, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                        logger.info(encryptedPath + ' is deleted!');
                    })
                }, 2 * 60 * 1000)
            }
            else {
                console.log("File decryption in progress...");
            }
        }
    )
})

module.exports = router
