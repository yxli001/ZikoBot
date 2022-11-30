const { Events } = require("discord.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setPresence({
			activities: [{ name: "with ur mom" }],
			status: "mobile",
		});
		console.log("Ziko is online.");
	},
};
