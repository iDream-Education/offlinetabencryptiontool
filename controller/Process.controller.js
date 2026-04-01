import { fork } from "child_process"
import fs from "fs"
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Path & File Reader Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const encryptProcess = async (req, res) => {
	try {
		const uploadedFilePath = resolve(__dirname, "..", req.file.path);
		const processedFilePath = resolve(__dirname, "..", "encrypted", req.file.filename);
		// get Child Process
		const childProcess = fork("./util/processFile.js");
		childProcess.send({
			"path": uploadedFilePath,
			"processedFileLocation": processedFilePath,
			"method": "encrypt"
		})
		childProcess.on("error", message => {
			// remove uploaded file from the server if it exsists.
			if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
			return res.status(500).json({ error: message });
		});
		childProcess.on('exit', code => {
			if (code == 0) {
				// remove uploaded file from the server if it exsists.
				if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
				if (fs.existsSync(processedFilePath)) {
					let fileObject = { ...req.file };
					delete fileObject["destination"];
					fileObject.path = "/encrypted/" + fileObject.path.split("/")[1];
					return res.status(200).json({ file: fileObject });
				}
			} else {
				return res.status(500).json({ error: "Some Error Occured" });
			}
		});
	} catch (error) {
		return res.status(500).json({ error: `${error.message}` })
	}
}

const decryptProcess = async (req, res) => {
	try {
		// get Child Process
		const childProcess = fork("./util/processFile.js");
		const uploadedFilePath = resolve(__dirname, "..", req.file.path);
		const processedFilePath = resolve(__dirname, "..", "decrypted", req.file.filename)
		childProcess.send({
			"path": uploadedFilePath,
			"processedFileLocation": processedFilePath,
			"method": "decrypt"
		})
		childProcess.on("message", message => res.send(message));
		childProcess.on("error", (message) => {
			// remove uploaded file from the server if it exsists.
			if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
			return res.status(500).json({ error: message });
		});
		childProcess.on('exit', code => {
			if (code == 0) {
				// remove uploaded file from the server if it exsists.
				if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
				if (fs.existsSync(processedFilePath)) {
					let fileObject = { ...req.file };
					delete fileObject["destination"];
					fileObject.path = "/decrypted/" + fileObject.path.split("/")[1];
					// return res.status(200).json({ file: fileObject });
				}
			} else return res.status(500).json({ error: "Some Error Occured" });
		});
	} catch (error) {
		return res.status(500).json({ error: `${error.message}` });
	}
}

export { encryptProcess, decryptProcess }