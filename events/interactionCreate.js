const { Events } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		try {
			let guild = await Guild.findOne({
				guildId: interaction.guild.id,
			});

			if (!guild)
				guild = new Guild({
					guildId: interaction.guild.id,
					users: [],
				});

			let user = guild.users.find(
				(user) => user.userId === interaction.user.id
			);

			if (!user)
				guild.users.push({
					userId: interaction.user.id,
				});

			await guild.save();
		} catch (e) {
			console.log(e);
		}

		const command = interaction.client.commands.get(
			interaction.commandName
		);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	},
};
