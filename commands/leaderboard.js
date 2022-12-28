const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Get your server's leaderboard based on coins. "),
	async execute(interaction) {
		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});

			const users = guild.users.sort((a, b) =>
				a.coins > b.coins ? -1 : 1
			);

			const leaderboardEmbed = new EmbedBuilder()
				.setColor("#4287f5")
				.setTitle(`${interaction.guild.name} Leaderboard`)
				.setThumbnail(interaction.guild.iconURL());

			for (let i = 0; i < users.length; i++) {
				const user = users[i];
				const userObject = await interaction.guild.members.fetch(
					user.userId
				);

				leaderboardEmbed.addFields({
					name: `${i + 1}. ${userObject.user.username}`,
					value: `$${user.coins}`,
				});
			}

			await interaction.reply({ embeds: [leaderboardEmbed] });
		} catch (e) {
			console.log(e);
		}
	},
};
