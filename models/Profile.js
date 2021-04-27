const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
	userID: { type: String, required: true, unique: true },
	serverID: { type: String, required: true },
	coins: { type: Number, default: 1000 },
	bank: { type: Number },
	lastBeg: { type: Number },
	lastDaily: { type: Number },
});

module.exports = mongoose.model("profile", profileSchema);
