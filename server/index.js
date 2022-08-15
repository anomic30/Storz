const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user')
const { v4: uuidv4 } = require('uuid');
const { Magic } = require('@magic-sdk/admin');
const path = require('path');
const authMiddleware = require('./middlewares/authMiddleware');
const { fs, readFileSync, createWriteStream, unlink, readdirSync, rmSync, unlinkSync } = require('fs');
require('dotenv').config();
const jscrypt = require('jscrypt');
const { create } = require("ipfs-http-client");
const fileUpload = require('express-fileupload');

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


const app = express();
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

//connection to DB

const dburl = 'mongodb+srv://storz:storz4321@storz.js4i1.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(dburl).then(() => { console.log('Connected to StorzDB') })
    .catch((err) => {
        console.log(err)
    })


app.get('/', (req, res) => {
    res.send('Welcome to Storz API v1.0!');
});

app.post("/test", authMiddleware, (req, res) => {
    return res.status(200).json("User can use secure APIs");
})

app.post('/api/user/check', async (req, res) => {
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

app.post('/api/user/login', async (req, res) => {
    try {
        console.log("called")
        const didToken = req.headers.authorization.substring(7);
        await magic.token.validate(didToken);
        console.log("user is authenticated");
        return res.status(200).json({ authenticated: true });
    } catch (error) {
        console.log("user is not authenticated");
        return res.status(500).json({ error: error.message });
    }
});

app.post('/api/user/create', authMiddleware, async (req, res) => {
    const magic_id = req.body.magic_id;
    const user_name = req.body.user_name;
    const email = req.body.email;

    if (!user_name || !magic_id || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const count = await User.count();
    console.log("doc count:" + count);
    if (count == 0) {
        console.log("trying to create a user")
        const encryption_key = uuidv4();
        const user = new User({
            magic_id: magic_id,
            email: email,
            user_name: user_name,
            encryption_key: encryption_key,
            files: []
        })
        console.log("saving user")
        await user.save();
        return res.status(200).json({ message: "User created successfully" });
    }
    else {
        console.log("finding user if exists")
        const user = await User.findOne({ magic_id: magic_id });
        console.log("user: " + user);
        if (user) {
            console.log("User already exists!")
            return res.status(200).json({ message: "User already exists" });
        } else {
            console.log("User not found!")
            try {
                console.log("trying to create a user")
                const encryption_key = uuidv4();
                const user = new User({
                    magic_id: magic_id,
                    email: email,
                    user_name: user_name,
                    encryption_key: encryption_key,
                    files: []
                })
                console.log("saving user")
                await user.save();
                return res.status(200).json({ message: "User created successfully" });
            } catch (err) {
                return res.status(500).json({ error: err.message });
            }
        }
    }
})


//old upload file route
// app.post("/uploadFiles", authMiddleware, upload.any('file'), async (req, res) => {
//     const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
//     const fileNameArr = req.files.map(file => file.filename);
//     const storage = new Web3Storage({ token: apiToken });
//     try {

//         //iterate fileNameArr
//         for (let i = 0; i < fileNameArr.length; i++) {
//             jscrypt.encryptFile(
//                 `./private/${fileNameArr[i]}`,
//                 `./uploads/${fileNameArr[i]}`,
//                 "aes256",
//                 "storz123",
//                 655000,
//                 (isDone) => { if (isDone === true) { console.log(fileNameArr[i] + ' is encrypted successfully!'); } });
//         }

//         const files = await getFilesFromPath('./uploads');
//         const rootCid = await storage.put(files);

//         console.log("Files successfully uploaded with CID: " + rootCid);

//         await User.updateOne({ magic_id: metadata.issuer }, { $push: { files: { cid: rootCid, public: false } } });


//         readdirSync('./private').forEach(f => {
//             if (fileNameArr.includes(f)) {
//                 rmSync(`./private/${f}`);
//             }
//         });

//         return res.status(200).json({ message: "File uploaded successfully", cid: rootCid });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// })

const addFile = async (fileName, filePath) => {
    const file = readFileSync(filePath);
    const ipfs = await ipfsClient();
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    return fileAdded;
}

app.post("/api/upload", authMiddleware, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const user = await User.findOne({ magic_id: metadata.issuer }, { encryption_key: 1 });
    console.log(user);
    if (metadata.issuer === "") {
        return res.status(500).json({ error: "User is not authenticated" });
    }
    // console.log(req.files.files);
    let files = req.files.files;
    //if files is not an array, make it an array
    if (!Array.isArray(files)) {
        files = [files];
    }
    try {
        let uploadList = [];
        //iterate req.files and move it to test folder
        for (let file of files) {
            // const file = files[i];
            const fileName = file.name;
            const filePath = './private/' + fileName;
            const encryptedPath = './encrypted/' + fileName;

            file.mv(filePath, async (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: err.message });
                }
                
                console.log("encrypting file started");
                try {
                    jscrypt.encryptFile(
                        filePath,
                        encryptedPath,
                        "aes256",
                        user.encryption_key,
                        655000,
                        async (isDone) => {
                            if (isDone === true) {
                                console.log(fileName + ' is encrypted successfully!');

                                console.log("Adding files to IFPS in next step")
                                const fileAdded = await addFile(fileName, encryptedPath);
                                console.log(fileAdded);

                                let upData = {
                                    file_name: fileAdded.path,
                                    public: false,
                                    cid: fileAdded.cid,
                                    file_creationDate: new Date().toISOString(),
                                    file_size: fileAdded.size
                                };
                                uploadList.push(upData);
                                await User.updateOne({ magic_id: metadata.issuer }, { $push: { files: upData } });

                                unlink(filePath, (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log(filePath + ' is deleted!');
                                })
                                unlink(encryptedPath, (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log(encryptedPath + ' is deleted!');
                                })
                            }
                            else {
                                console.log(fileName + ' is not encrypted!');
                            }
                        }
                    );
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ error: error.message, message: "Couldn't upload your files at this moment" });
                }
            })
        }
        return res.status(200).json({ message: "Files uploaded successfully", uploadList: uploadList });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Couldn't upload your files at this moment" });
    }
})

app.post("/api/user/files", authMiddleware, async (req, res) => {
    const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
    const magic_id = metadata.issuer;
    const user = await User.findOne({ magic_id: magic_id });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }
    const files = user.files;
    return res.status(200).json({ files: files, owner: user.user_name });
})

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

app.get("/api/download/secure/:cid/:auth", async (req, res) => {
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
            return res.status(200).sendFile("./private/rickroll.gif", { root: __dirname });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

app.get("/api/download/:cid", async (req, res) => {
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
            return res.status(200).sendFile("./private/rickroll.gif", { root: __dirname });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})


app.patch("/api/user/makePublic/:cid", authMiddleware, async (req, res) => {
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

app.patch("/api/user/deleteFile/:cid", authMiddleware, async (req, res) => {
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

app.get("/api/user/getName/:id", async (req, res) => {
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})