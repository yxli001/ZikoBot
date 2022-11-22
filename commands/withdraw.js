const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { formatDuration } = require("../utils/utils");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("withdraw")
		.setDescription(
			"Withdraw [amount] of money from you bank balance to your wallet balance"
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("The amount to withdraw")
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

			if (amount > user.bank) {
				return interaction.reply(
					`You don't have ${amount} coins to withdraw`
				);
			}

			user.coins += amount;
			user.bank -= amount;

			await guild.save();

			interaction.reply(
				`Successfully withdrew ${amount} coins from your bank`
			);
		} catch (err) {
			console.error(err);
		}
	},
};
