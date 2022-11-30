const axios = require("axios").default;
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pickup")
		.setDescription(";)")
		.addUserOption((option) =>
			option.setName("user").setDescription("the person you want ;)")
		),
	async execute(interaction) {
		const user = interaction.options.getUser("user");

		try {
			// const { data } = await axios.get(
			// 	"https://jokeandpickupapi.herokuapp.com/pickup/random"
			// );
			// const { title, body } = data;
			const { data } = await axios.get("https://api.jcwyt.com/pickup");
			let message = data;

			for (let i = 0; i < data.length; i++) {
				if (!(data.substring(i, i + 1) == "{")) {
					continue;
				}

				if (data.substring(i + 2, i + 3) == "u")
					message =
						data.substring(0, i) +
						(user ? ` ${user} ` : " ") +
						data.substring(i + 8, data.length - 1);

				if (data.substring(i + 2, i + 3) == "n")
					message =
						data.substring(0, i) +
						(user ? ` ${user} ` : " ") +
						data.substring(i + 8, data.length - 1);
			}

			await interaction.reply(message);

			// await interaction.reply(
			// 	`${user !== null ? `<@${user.id}>` : ""} ${message}`
			// );

			// if (body && body !== "")
			// 	setTimeout(async () => {
			// 		await interaction.channel.send(body);
			// 	}, 2000);
		} catch (e) {
			console.log(e);
		}
	},
};
