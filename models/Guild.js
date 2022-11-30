const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
	guildId: { type: String, required: true, unique: true },
	users: [
		{
			userId: { type: String, required: true },
			coins: { type: Number, default: 1000 },
			bank: { type: Number, default: 0 },
			lastBeg: { type: Number },
			lastDaily: { type: Number },
		},
	],
});

module.exports = mongoose.model("guild", guildSchema);
