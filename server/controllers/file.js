const { createWriteStream, unlink, readFileSync } = require('fs');
const jscrypt = require('jscrypt');
const { Magic } = require('@magic-sdk/admin');
const { create } = require("ipfs-http-client");
const path = require('path')

const User = require('../data-repository/user');

const magic =  new Magic(process.env.MAGIC_SECRET_KEY);

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

/*
    Connection to the INFURA IPFS node
    Get the secret keys from the INFURA IPFS dashboard
    Website link: https://infura.io/product/ipfs
*/
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

const addFile = async (fileName, filePath) => {
    const file = readFileSync(filePath);
    const ipfs = await ipfsClient();
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    console.log(fileAdded)
    return fileAdded;
}


module.exports = class DownloadController{
    static async secureDownload(req, res){
        console.log("Secure download called");
        const cid = req.params.cid;
        const auth = req.params.auth;
        const metadata = await magic.users.getMetadataByToken(auth);
        const magic_id = metadata.issuer;
    
        try {
            const file = await User.findOne({ magic_id: magic_id, files: { $elemMatch: { cid: cid } } }, { encryption_key: 1 }).select({ files: { $elemMatch: { cid: cid } } }); 
            if (file) {
                const fileName = file.files[0].file_name;
                const encryptedPath = '../server/private/' + fileName;
                const decryptedPath = '../server/public/' + fileName;
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
                                    res.sendFile(path.resolve(decryptedPath));
    
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
    }

    static async download(req, res){
        const cid = req.params.cid;
        try {
            const file = await User.findOne({ files: { $elemMatch: { cid: cid, public: true } } }, { encryption_key: 1 }).select({ files: { $elemMatch: { cid: cid, public: true } } });
            if (file) {
                const fileName = file.files[0].file_name;
                const encryptedPath = '../server/encrypted/' + fileName;
                const decryptedPath = '../server/public/' + fileName;
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
                                    res.sendFile(path.resolve(decryptedPath));
    
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
    }

    static async upload(req, res){
        const metadata = await magic.users.getMetadataByToken(req.headers.authorization.substring(7));
        const user = await User.findOne({ magic_id: metadata.issuer }, { encryption_key: 1 });
        // console.log(user);
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
                const filePath = '../server/private/' + fileName;
                const encryptedPath = '../server/encrypted/' + fileName;
    
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
                                    let uupd = await User.updateOne({ magic_id: metadata.issuer }, { $push: { files: upData } });
                                        console.log(uupd);
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
    }
}