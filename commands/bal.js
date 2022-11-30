const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bal")
		.setDescription("Get your wallet and bank balance."),
	async execute(interaction) {
		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});
			const user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			const balanceEmbed = new EmbedBuilder()
				.setColor("#000000")
				.setTitle(`${interaction.user.username}'s balance`)
				.setThumbnail(interaction.user.avatarURL())
				.setDescription(
					`Wallet: **${user.coins}**\nBank: **${user.bank}**`
				);

			await interaction.reply({ embeds: [balanceEmbed] });
		} catch (e) {
			console.log(e);
		}
	},
};
