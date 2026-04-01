import { Schema } from "mongoose";

const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true,
	},
	lastLogin: {
		type: Date,
		default: Date.now(),
	}
}, {
	timestamps: true,
})