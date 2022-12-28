const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("gamble")
		.setDescription("Gamble some money, double or nothing")
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("The amount to gamble")
				.setRequired(true)
		),
	async execute(interaction) {
		const amount = interaction.options.getInteger("amount");
		const won = Math.random() < 0.58;
		const jackpot = Math.random() < 0.01;

		try {
			const guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});
			const user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			if (amount % 1 != 0 || amount <= 0)
				return await interaction.reply(
					"Deposit amount must be a positive integer"
				);

			if (amount > user.coins)
				return await interaction.reply("You don't got the funds buddy");

			if (jackpot) amount += 10000;
			if (won) user.coins += amount;
			else user.coins -= amount;

			await guild.save();
			await interaction.reply(
				`${jackpot ? "JACKPOT!!!! " : ""}You ${
					won ? "won" : "lost"
				} ${amount} coin${amount > 1 ? "s" : ""}.`
			);
		} catch (e) {
			console.log(e);
		}
	},
};
