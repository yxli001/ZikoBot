const { Events } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
		try {
			const guild = await Guild.findOne({ guildId: member.guild.id });
			let user = guild.users.find((user) => user.userId === member.id);

			if (!user)
				guild.users.push({
					userId: member.id,
				});

			await guild.save();
		} catch (e) {
			console.log(e);
		}
	},
};
