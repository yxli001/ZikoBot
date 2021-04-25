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

	if (command === "team") {
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
			const response = await axios.get(
				"https://na.api.riotgames.com/val/status/v1/platform-data",
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
				.setTitle("Valorant NA Server Status");

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
			const actsResponse = await axios.get(
				"https://na.api.riotgames.com/val/content/v1/contents",
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
				.setTitle(`${activeEpisode.name} ${activeAct.name} Ranked Leaderboard`)
				.addField("\u200B", "\u200B");

			const leaderboardResponse = await axios.get(
				`https://na.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${activeAct.id}?size=10&startIndex=0`,
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
	}
});

client.login(process.env.DISCORD_TOKEN);
