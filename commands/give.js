const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("give")
		.setDescription("Give the poor some money.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to give to")
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("The amount to deposit")
				.setRequired(true)
		),
	async execute(interaction) {
		const userOption = interaction.options.getUser("user");
		const amount = interaction.options.getInteger("amount");

		if (amount % 1 != 0 || amount <= 0)
			return await interaction.reply(
				"Deposit amount must be a positive integer"
			);

		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});

			const fromUser = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			const toUser = guild.users.find(
				(user) => user.userId === userOption.id
			);

			if (amount > fromUser.coins) {
				return interaction.reply(
					`You don't have ${amount} coins to give`
				);
			}

			fromUser.coins -= amount;
			toUser.coins += amount;

			await guild.save();

			await interaction.reply(
				`Successfully gave ${amount} coins to <@${toUser.userId}>`
			);
		} catch (err) {
			console.error(err);
		}
	},
};
