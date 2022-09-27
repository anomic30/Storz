const fs  = require('fs');
const crypto = require('crypto');

async function encryptFile(sourcePath, destinationPath, algorithm, password, chunkSize, callback){
  console.log('encryptFile from storzcrypt.js');
  
  const salt = crypto.randomBytes(32)

  const KEY = crypto.scryptSync(password, salt, 32);
  const IV = crypto.randomBytes(16)

  chunkSize = (chunkSize === 0) ? chunkSize = 665539 : chunkSize;
  const inFile = fs.createReadStream(sourcePath, { highWaterMark: chunkSize });
  const outFile = fs.createWriteStream(destinationPath);
  const cipher = crypto.createCipheriv(algorithm, KEY, IV)
  const size = fs.statSync(sourcePath).size;
  inFile.on('data', (data) => {
    // const percentage = parseInt(inFile.bytesRead) / parseInt(size) * 100;
    const encrypted = cipher.update(data);
    outFile.write(encrypted);
    // callback(percentage);
  })

  inFile.on('close', function() {
    outFile.write(cipher.final());
    outFile.close();
    callback(true);
  });
}

async function decryptFile(){
  console.log('decryptFile from storzcrypt.js');
  
  const salt = crypto.randomBytes(32)

  const KEY = crypto.scryptSync(password, salt, 32);
  const IV = crypto.randomBytes(16)

  chunkSize = (chunkSize === 0) ? chunkSize = 665539 : chunkSize;
  const inFile = fs.createReadStream(sourcePath, { highWaterMark: chunkSize });
  const outFile = fs.createWriteStream(destinationPath);
  const cipher = crypto.createDecipheriv(algorithm, KEY, IV)
  const size = fs.statSync(sourcePath).size;
  inFile.on('data', (data) => {
    // const percentage = parseInt(inFile.bytesRead) / parseInt(size) * 100;
    const encrypted = cipher.update(data);
    outFile.write(encrypted);
    // callback(percentage);
  })

  inFile.on('close', function() {
    outFile.write(cipher.final());
    outFile.close();
    callback(true);
  });
}


/*
var fs = require('fs');
var crypto = require('crypto');

function encryptFile(sourcePath, destinationPath, algorithm, password, chunkSize, callback) {
    chunkSize = (chunkSize === 0) ? chunkSize = 665539 : chunkSize;
    var inFile = fs.createReadStream(sourcePath, { highWaterMark: chunkSize });
    var outFile = fs.createWriteStream(destinationPath);
    var encryptor = crypto.createCipher(algorithm, password);
    var size = fs.statSync(sourcePath).size;
    inFile.on('data', function(data) {
        var percentage = parseInt(inFile.bytesRead) / parseInt(size) * 100;
        var encrypted = encryptor.update(data);
        outFile.write(encrypted);
        callback(percentage);
    });
    inFile.on('close', function() {
        outFile.write(encryptor.final());
        outFile.close();
        callback(true);
    });
}

function decryptFile(sourcePath, destinationPath, algorithm, password, chunkSize, callback) {
    chunkSize = (chunkSize === 0) ? chunkSize = 665539 : chunkSize;
    var inFile = fs.createReadStream(sourcePath, { highWaterMark: chunkSize });
    var outFile = fs.createWriteStream(destinationPath);
    var decryptor = crypto.createDecipher(algorithm, password);
    var size = fs.statSync(sourcePath).size;
    inFile.on('data', function(data) {
        var percentage = parseInt(inFile.bytesRead) / parseInt(size) * 100;
        var decrypted = decryptor.update(data);
        outFile.write(decrypted);
        callback(percentage);
    });
    inFile.on('close', function() {
        outFile.write(decryptor.final());
        outFile.close();
        callback(true);
    });

}
*/


module.exports = { encryptFile, decryptFile };