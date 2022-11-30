const { Events } = require("discord.js");

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		if (message.author.bot) return;
		// let yes = Math.random() < 0.45;
		// if (
		// 	message.content.includes("mom") ||
		// 	message.content.includes("mother")
		// )
		// 	await message.reply("ur mom");
	},
};
