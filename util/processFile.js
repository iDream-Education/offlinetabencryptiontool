import fs from "fs"
import BufferList from 'bl';
import crypto from "crypto"
import { Base64Decode } from "base64-stream"
// Constant Initialization Vector 
const iv = `${process.env.ENCRYPTION_DECRYPTION_HASH}`;
// Constant Secret Password
const password = `${process.env.ENCRYPTION_DECRYPTION_KEY}`;
// To Use Runtime Password
function getCipherKey(password) {
	let keyHash = crypto.createHash('sha256')
		.update(password)
		.digest("hex")
		.substring(0, 32);

	let keyBl = new BufferList();
	let keyCharArray = keyHash.split("");

	for (var i = 0; i < 32; i++) {
		keyBl.append(keyCharArray.shift() || [null]);
	}

	return keyBl;
}

function getIV(initVector) {
	let ivBl = new BufferList();
	let ivCharArray = [];

	if (initVector && initVector.length > 0) {
		ivCharArray = initVector.split('');
	}

	for (var i = 0; i < 16; i++) {
		ivBl.append(ivCharArray.shift() || [null]);
	}

	return ivBl;
}
// Encryption Function
function encrypt(fileInfo) {
	try {
		const cipherKey = getCipherKey(password).toString();
		const readStream = fs.createReadStream(fileInfo['path']);
		const InitVect = getIV(iv).toString();
		const cipher = crypto.createCipheriv("AES-256-CBC", cipherKey, InitVect);
		// set output encoding
		cipher.setEncoding("base64");
		const writeStream = fs.createWriteStream(fileInfo['processedFileLocation']);

		const streamEvent = readStream
			.pipe(cipher)
			.pipe(writeStream);

		streamEvent.on('finish', (event) => {
			process.send({ msg: "Process Finished" })
			process.exit(event)
		})

		streamEvent.on('error', (event) => {
			process.send({ error: `${event}` })
			process.exit(event);
		});

	} catch (error) {
		process.send({ error: error })
		process.exit(error);
	}
}
// Decryption Function
function decrypt(fileInfo) {
	try {
		const cipherKey = getCipherKey(password).toString();
		const readStream = fs.createReadStream(fileInfo['path']);
		const InitVect = getIV(iv).toString();
		const decipher = crypto.createDecipheriv('AES-256-CBC', cipherKey, InitVect);
		// set output encoding
		decipher.setEncoding("utf8");
		const writeStream = fs.createWriteStream(fileInfo['processedFileLocation']);

		const decoder = new Base64Decode();

		const streamEvent = readStream
			.pipe(decoder)
			.pipe(decipher)
			.pipe(writeStream);

		decipher.on('error', (err) => {
			console.log(err)
			process.exit(1)
		});

		streamEvent.on('finish', (event) => {
			process.send({ msg: "Process Finished" })
			process.exit(event)
		});

		streamEvent.on('error', (event) => {
			process.send({ error: `${event}` })
			process.exit(event);
		});

	} catch (error) {
		process.send({ error: error })
		process.exit(error);
	}
}

// Recieve Message on Child Process
process.on(("message"), (fileInfo) => {
	try {
		// message is file path
		if (fileInfo['method'] == "encrypt") encrypt(fileInfo)
		else if (fileInfo['method'] == "decrypt") decrypt(fileInfo)
		else process.exit();
	} catch (error) {
		process.exit(1);
	}
});