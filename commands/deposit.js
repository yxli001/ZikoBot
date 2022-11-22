const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { formatDuration } = require("../utils/utils");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("deposit")
		.setDescription(
			"Deposit [amount] of money from your wallet balance to your bank balance"
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("The amount to deposit")
				.setRequired(true)
		),
	async execute(interaction) {
		const amount = interaction.options.getInteger("amount");

		if (amount % 1 != 0 || amount <= 0)
			return interaction.reply(
				"Deposit amount must be a positive integer"
			);

		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});

			const user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			if (amount > user.coins) {
				return interaction.reply(
					`You don't have ${amount} coins to deposit`
				);
			}

			user.coins -= amount;
			user.bank += amount;

			await guild.save();

			interaction.reply(
				`Successfully deposited ${amount} coins into your bank`
			);
		} catch (err) {
			console.error(err);
		}
	},
};
