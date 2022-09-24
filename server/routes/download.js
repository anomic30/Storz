const router = require("express").Router();
const { fs, readFileSync, createWriteStream, unlink, readdirSync, rmSync, unlinkSync } = require('fs');
const jscrypt = require('jscrypt');
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


router.get("/api/download/secure/:cid/:auth", async (req, res) => {
    console.log("Secure download called");
    const cid = req.params.cid;
    const auth = req.params.auth;
    const metadata = await magic.users.getMetadataByToken(auth);
    const magic_id = metadata.issuer;

    try {
        const file = await User.findOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { encryption_key: 1 }).select({ files: { $elemMatch: { cid: cid } } });
        if (file) {
            const fileName = file.files[0].file_name;
            const encryptedPath = './private/' + fileName;
            const decryptedPath = './public/' + fileName;
            await getFile(cid, encryptedPath).then(async() => {
                try {
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
                                res.sendFile(decryptedPath, { root: __dirname });

                                setTimeout(() => {
                                    unlink(decryptedPath, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        console.log(decryptedPath + ' is deleted!');
                                    })

                                    unlink(encryptedPath, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        console.log(encryptedPath + ' is deleted!');
                                    })
                                }, 2 * 60 * 1000)

                            }
                            else {
                                console.log("File decryption in progress...");
                            }
                        }
                    )
                } catch (err) {
                    console.log(err);
                    return res.status(500).json({ error: err.message });
                }
            })
        } else {
            return res.status(200).sendFile("../private/hacker.png", { root: __dirname });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

router.get("/api/download/:cid", async (req, res) => {
    const cid = req.params.cid;
    try {
        const file = await User.findOne({ files: { $elemMatch: { cid: cid, public: true } } }, { encryption_key: 1 }).select({ files: { $elemMatch: { cid: cid, public: true } } });
        if (file) {
            const fileName = file.files[0].file_name;
            const encryptedPath = './encrypted/' + fileName;
            const decryptedPath = './public/' + fileName;
            await getFile(cid, encryptedPath).then(async() => {
                try {
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
                                res.sendFile(decryptedPath, { root: __dirname });

                                setTimeout(() => {
                                    unlink(decryptedPath, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        console.log(decryptedPath + ' is deleted!');
                                    })

                                    unlink(encryptedPath, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        console.log(encryptedPath + ' is deleted!');
                                    })
                                }, 2 * 60 * 1000)
                            }
                            else {
                                console.log("File decryption in progress...");
                            }
                        }
                    )
                } catch (err) {
                    console.log(err);
                    return res.status(500).json({ error: err.message });
                }
            })
        } else {
            return res.status(200).sendFile("../private/hacker.png", { root: __dirname });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

module.exports = router
