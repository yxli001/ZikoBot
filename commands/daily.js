const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { formatDuration } = require("../utils/utils");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("daily")
		.setDescription(
			"Receive daily coins. one can only get daily once every 24 hours"
		),
	async execute(interaction) {
		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});
			const user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			let coolDown = 86400000;
			let lastDaily = user.lastDaily || 0;

			if (Date.now() - lastDaily > coolDown) {
				const amount = 500;

				user.coins += amount;
				user.lastDaily = Date.now();

				await guild.save();

				await interaction.reply(
					`You received your daily of ${amount} coins`
				);
			} else {
				await interaction.reply(
					`Too soon, you can get daily again in ${formatDuration(
						coolDown - (Date.now() - user.lastDaily)
					)}`
				);
			}
		} catch (e) {
			console.log(e);
		}
	},
};
