const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("insult")
		.setDescription("Send a randomly generated insult.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Send the insult to a specified user")
		),
	async execute(interaction) {
		const whichApiToUse = Math.floor(Math.random() * 2) === 1;

		let response;

		if (whichApiToUse) {
			response = await axios.get(
				"https://evilinsult.com/generate_insult.php?lang=en&amp;type=json"
			);
		} else {
			response = await axios.get("https://insult.mattbas.org/api/insult");
		}

		let insult = response.data;
		const taggedUser =
			interaction.options.getUser("user") ?? interaction.user;

		if (taggedUser == interaction.client.user)
			insult = "Peasant, how dare you try to insult your king.";

		await interaction.reply(`<@${taggedUser.id}>, ${insult}`);
	},
};
