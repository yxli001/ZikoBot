const Discord = require("discord.js");
const axios = require("axios").default;
require("dotenv").config();

const client = new Discord.Client();

const prefix = "+";

client.once("ready", () => {
	console.log("Ziko is online.");
});

client.on("message", async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "help" || command === "") {
		const helpEmbed = new Discord.MessageEmbed()
			.setColor("#000000")
			.setTitle("Ziko Bot Commands")
			.addFields([
				{
					name: "prefix",
					value: "+",
				},
				{
					name: "status [server(default=na)]",
					value:
						"check valorant servers' status (including maintenances and incidents)",
				},
				{
					name: "leaderboard [server(default=na)] [size(default=10)]",
					value:
						"get the top [size] of the valorant leaderboard of the specified server",
				},
				{
					name: "servers",
					value: "get a list of the abbreviations of all the valorant servers",
				},
			]);

		message.channel.send({ embed: helpEmbed });
	} else if (command === "team") {
		const teamEmbed = {
			color: 0x00000,
			title: "ZCH",
			description: "Ziko's Club House Competitive Valorant Esports Team",
			thumbnail: {
				url:
					"https://cdn1.dotesports.com/wp-content/uploads/2021/01/26075431/Valorant-ss-scaled-1.jpg",
			},
			fields: [
				{
					name: "\u200B",
					value: "\u200B",
				},
				{
					name: "ZCH Chonk",
					value: "Intiator",
				},
				{
					name: "ZCH yxli",
					value: "Duelist",
				},
				{
					name: "ZCH WOWEE",
					value: "Duelist",
				},
				{
					name: "ZCH Mocha4Days",
					value: "Sentinel",
				},
				{
					name: "ZCH Jim Jim",
					value: "Controller",
				},
				{
					name: "\u200B",
					value: "\u200B",
				},
			],
			timestamp: new Date(),
		};
		message.channel.send({ embed: teamEmbed });
	} else if (command === "status") {
		try {
			let server = "na";

			if (args.length === 1) {
				server = args[0].toLowerCase();
			}

			const response = await axios.get(
				`https://${server}.api.riotgames.com/val/status/v1/platform-data`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_AUTH_TOKEN,
					},
				}
			);

			const platformData = response.data;
			const maintenanceStatus = platformData.maintenance_status;
			const maintenances = platformData.maintenances;
			const incidents = platformData.incidents;

			const statusEmbed = new Discord.MessageEmbed()
				.setColor("#000000")
				.setTitle(`Valorant ${server.toUpperCase()} Server Status`);

			if (maintenanceStatus == null) {
				statusEmbed.addField("Maintenance Status", "Not under maintenance");
			} else {
				statusEmbed.addField("Maintenance Status", maintenanceStatus);
			}

			for (maintenance of maintenances) {
				statusEmbed.addField(
					maintenance.titles[0].content,
					maintenance.updates[0].translations[0].content
				);
			}

			for (incident of incidents) {
				statusEmbed.addField(
					`${
						incident.incident_severity.charAt(0).toUpperCase() +
						incident.incident_severity.slice(1)
					} - ${incident.titles[0].content}`,
					incident.updates[0].translations[0].content
				);
			}

			message.channel.send({ embed: statusEmbed });
		} catch (err) {
			console.error(err.message);
		}
	} else if (command === "leaderboard") {
		try {
			let size = 10;
			let server = "na";

			if (args.length == 2) {
				server = args[0].toLowerCase();
				size = Number.parseInt(args[1]);
			}

			if (args.length == 1) {
				if (isNaN(Number.parseInt(args[0]))) {
					server = args[0].toLowerCase();
				} else {
					size = Number.parseInt(args[0]);
				}
			}

			const actsResponse = await axios.get(
				`https://${server}.api.riotgames.com/val/content/v1/contents`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_AUTH_TOKEN,
					},
				}
			);
			const contents = actsResponse.data;
			const acts = contents.acts;
			const activeAct = acts.filter((act) => act.isActive === true)[0];
			const activeEpisode = acts.filter(
				(act) => act.id === activeAct.parentId
			)[0];

			const leaderboardEmbed = new Discord.MessageEmbed()
				.setColor("#000000")
				.setTitle(
					`${activeEpisode.name} ${
						activeAct.name
					} ${server.toUpperCase()} Ranked Leaderboard`
				)
				.addField("\u200B", "\u200B");

			const leaderboardResponse = await axios.get(
				`https://${server}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${activeAct.id}?size=${size}&startIndex=0`,
				{
					headers: {
						"X-Riot-Token": process.env.RIOT_AUTH_TOKEN,
					},
				}
			);

			const players = leaderboardResponse.data.players;

			for (player of players) {
				leaderboardEmbed.addField(
					`Rank ${player.leaderboardRank}`,
					`${player.gameName}#${player.tagLine} | ${player.rankedRating} RR | ${player.numberOfWins} wins`
				);
			}

			message.channel.send({ embed: leaderboardEmbed });
		} catch (err) {
			console.error(err.message);
		}
	} else if (command === "servers") {
		const serversEmbed = new Discord.MessageEmbed()
			.setColor("#000000")
			.setTitle("Valorant Servers Abbreviations")
			.addFields([
				{
					name: "AP",
					value: "Asia Pacific",
					inline: true,
				},
				{
					name: "BR",
					value: "Brazil",
					inline: true,
				},
				{
					name: "EU",
					value: "Europe",
					inline: true,
				},
				{
					name: "KR",
					value: "Republic of Korea",
					inline: true,
				},
				{
					name: "LATAM",
					value: "Latin America",
					inline: true,
				},
				{
					name: "NA",
					value: "North America",
					inline: true,
				},
			]);

		message.channel.send({ embed: serversEmbed });
	}
});

client.login(process.env.DISCORD_TOKEN);
