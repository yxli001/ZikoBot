const { Events } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
	name: Events.GuildCreate,
	once: false,
	async execute(guild) {
		try {
			let newGuild = await Guild.findOne({ guildId: guild.id });

			if (!newGuild)
				newGuild = new Guild({
					guildId: guild.id,
					users: [],
				});

			await newGuild.save();
		} catch (e) {
			console.log(e);
		}
	},
};
