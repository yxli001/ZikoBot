const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Get a list of commands available."),
	async execute(interaction) {
		const fs = require("node:fs");

		const commands = [];
		// Grab all the command files from the commands directory you created earlier
		const commandFiles = fs
			.readdirSync("./commands")
			.filter((file) => file.endsWith(".js"));

		// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
		for (const file of commandFiles) {
			const command = require(`./${file}`);
			commands.push(command.data.toJSON());
		}

		commands.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});

		const helpEmbed = new EmbedBuilder()
			.setColor("#00d6cb")
			.setTitle("Ziko Bot Commands")
			.addFields(
				commands.map((command) => {
					return {
						name: `/${command.name} ${command.options
							.map((option) => `[${option.name}]`)
							.join(" ")}`,
						value: command.description,
					};
				})
			);

		await interaction.reply({ embeds: [helpEmbed] });
	},
};
