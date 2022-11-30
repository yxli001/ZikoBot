const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { formatDuration } = require("../utils/utils");
const Guild = require("../models/Guild.js");

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
					`You begged and received ${amount} **coins**.`
				);
			} else {
				await interaction.reply(
					`Too soon, you can beg again in ${formatDuration(
						coolDown - (Date.now() - lastBeg)
					)}`
				);
			}
		} catch (e) {
			console.log(e);
		}
	},
};
