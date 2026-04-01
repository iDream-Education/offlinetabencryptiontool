import express from "express";
import multer from "multer"
import { decryptProcess, encryptProcess } from "../controller/Process.controller.js"
/*-------------------Imports------------------*/
const uploadStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/')
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}
});

const fileUpload = multer({
	storage: uploadStorage,
	limits: {
		fileSize: 100000000 //Limit 100MB
	},
})

const Router = express.Router();

Router.post("/encrypt", fileUpload.single("fileToProcess"), encryptProcess);
Router.post("/decrypt", fileUpload.single("fileToProcess"), decryptProcess);

export default Router;