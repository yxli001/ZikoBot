const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild.js");

function msToTime(duration) {
	let milliseconds = Math.floor((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	// hours = hours < 10 ? "0" + hours : hours;
	// minutes = minutes < 10 ? "0" + minutes : minutes;

	let message = "";

	if (hours != 0) {
		message += `${hours} hour${hours > 1 ? "s" : ""}`;
	}
	if (minutes != 0) {
		message += `, ${minutes} minute${minutes > 1 ? "s" : ""}`;
	}
	if (seconds != 0) {
		message += `, and ${seconds} second${seconds > 1 ? "s" : ""}`;
	}

	return hours != 0
		? `${hours} hours and ${minutes} minute${minutes > 1 ? "s" : ""}`
		: `${minutes} minutes`;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("beg")
		.setDescription(
			"Beg to get a random amount of money (0-500) added to your wallet, one can only beg once every hour."
		),
	async execute(interaction) {
		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});
			const user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			let coolDown = 5 * 60 * 1000;
			let lastBeg = user.lastBeg || 0;

			if (Date.now() - lastBeg > coolDown) {
				const amount = Math.floor(Math.random() * 500) + 1;

				user.coins += amount;
				user.lastBeg = Date.now();

				await guild.save();

				await interaction.reply(
					`<@${interaction.user.id}>, you begged and received ${amount} **coins**.`
				);
			} else {
				await interaction.reply(
					`Too soon, you can beg again in ${msToTime(
						coolDown - (Date.now() - lastBeg)
					)}`
				);
			}
		} catch (e) {
			console.log(e);
		}
	},
};
