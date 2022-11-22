const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Get a list of commands available."),
	async execute(interaction) {
		const helpEmbed = new EmbedBuilder()
			.setColor("#00d6cb")
			.setTitle("Ziko Bot Commands")
			.addFields([
				{
					name: "/insult [user(default=you)]",
					value: "Send a randomly generated insult and ping the specified user",
				},
				{
					name: "/bal",
					value: "Get the your wallet and bank balance",
				},
				{
					name: "/beg",
					value: "Beg to get a random amount of money (0-500) added to your wallet, one can only beg once every hour",
				},
				{
					name: "/daily",
					value: "Receive daily coins. one can only get daily once every 24 hours",
				},
				{
					name: "/deposit [amount]",
					value: "Deposit [amount] of money from your wallet balance to your bank balance. amount has to be a positive integer",
				},
				{
					name: "/withdraw [amount]",
					value: "Withdraw [amount] of money from you bank balance to your wallet balance. amount has to be a positive integer",
				},
			]);

		await interaction.reply({ embeds: [helpEmbed] });
	},
};
