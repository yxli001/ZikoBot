require("dotenv").config();
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const axios = require("axios").default;
const fs = require("fs");
const path = require("node:path");
const mongoose = require("mongoose");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
	}
}

const token = process.env.DISCORD_TOKEN;

const Profile = require("./models/Profile");

const prefix = "+";

async function mongooseSetup() {
	await mongoose.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.r10bh.mongodb.net/?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		}
	);
}

function msToTime(duration) {
	var milliseconds = Math.floor((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	// hours = hours < 10 ? "0" + hours : hours;
	// minutes = minutes < 10 ? "0" + minutes : minutes;

	let message = "";

	if (hours != 0) {
		message += `${hours} hours`;
	}
	if (minutes != 0) {
		message += `, ${minutes} minutes`;
	}
	if (seconds != 0) {
		message += `, and ${seconds} seconds`;
	}

	return hours != 0
		? `${hours} hours and ${minutes} minutes`
		: `${minutes} minutes`;
}

mongooseSetup();

client.once(Events.ClientReady, () => {
	console.log("Ziko is online.");
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
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
});

client.on(Events.GuildMemberAdd, async (member) => {
	let profile = await Profile.create({
		userID: member.id,
		serverID: member.guild.id,
		coins: 1000,
		bank: 0,
	});

	await profile.save();
});

client.on(Events.MessageCreate, async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	let profileData;

	try {
		profileData = await Profile.findOne({ userID: message.author.id });
		if (!profileData) {
			let profile = await Profile.create({
				userID: message.author.id,
				serverID: message.guild.id,
				coins: 1000,
				bank: 0,
			});

			await profile.save();

			profileData = profile;
		}
	} catch (err) {
		console.error(err);
	}

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
				{
					name: "insult [user(default=you)]",
					value: "send a randomly generated insult and ping the specified user",
				},
				{
					name: "bal",
					value: "get the your wallet and bank balance",
				},
				{
					name: "beg",
					value:
						"beg to get a random amount of money (0-500) added to your wallet, one can only beg once every hour",
				},
				{
					name: "daily",
					value:
						"receive daily coins. one can only get daily once every 24 hours",
				},
				{
					name: "deposit [amount]",
					value:
						"deposit [amount] of money from your wallet balance to your bank balance. amount has to be a positive integer",
				},
				{
					name: "withdraw [amount]",
					value:
						"withdraw [amount] of money from you bank balance to your wallet balance. amount has to be a positive integer",
				},
			]);

		message.channel.send({ embed: helpEmbed });
	} else if (command === "insult") {
		const response = await axios.get(
			"https://evilinsult.com/generate_insult.php?lang=en&amp;type=json"
		);
		const insult = response.data;
		const taggedUser = message.mentions.users.first();

		if (taggedUser != null) {
			message.channel.send(`<@${taggedUser.id}>, ${insult}`);
		} else {
			message.channel.send(`<@${message.author.id}>, ${insult}`);
		}
	} else if (command === "bal") {
		const balanceEmbed = new Discord.MessageEmbed()
			.setColor("#000000")
			.setAuthor(
				`${message.author.username}'s Balance`,
				message.author.avatarURL
			)
			.setDescription(
				`Wallet: **${profileData.coins}**\nBank: **${profileData.bank}**`
			);

		message.channel.send({ embed: balanceEmbed });
	} else if (command === "beg") {
		let coolDown = 3600000;
		let lastBeg = profileData.lastBeg || 0;
		if (Date.now() - lastBeg > coolDown) {
			const amount = Math.floor(Math.random() * 500) + 1;
			const profile = await Profile.findOneAndUpdate(
				{
					userID: message.author.id,
				},
				{
					$inc: {
						coins: amount,
					},
					lastBeg: Date.now(),
				}
			);

			message.channel.send(
				`<@${message.author.id}>, you begged and received ${amount} **coins**.`
			);
		} else {
			message.channel.send(
				`Too soon, you can beg again in ${msToTime(
					coolDown - (Date.now() - profileData.lastBeg)
				)}`
			);
		}
	} else if (command === "daily") {
		let coolDown = 86400000;
		let lastDaily = profileData.lastDaily || 0;
		if (Date.now() - lastDaily > coolDown) {
			const amount = 500;
			await Profile.findOneAndUpdate(
				{
					userID: message.author.id,
				},
				{
					$inc: {
						coins: amount,
					},
					lastDaily: Date.now(),
				}
			);

			message.channel.send(`You received your daily of ${amount} coins`);
		} else {
			message.channel.send(
				`Too soon, you can get daily again in ${msToTime(
					coolDown - (Date.now() - profileData.lastDaily)
				)}`
			);
		}
	} else if (command === "deposit") {
		const amount = args[0];

		if (amount % 1 != 0 || amount <= 0)
			return message.channel.send(
				"Deposit amount must be a positive whole number"
			);

		try {
			if (amount > profileData.coins) {
				return message.channel.send(
					`You don't have ${amount} coins to deposit`
				);
			}

			await Profile.findOneAndUpdate(
				{
					userID: message.author.id,
				},
				{
					$inc: {
						coins: -amount,
						bank: amount,
					},
				}
			);

			message.channel.send(
				`Successfully deposited ${amount} coins into your bank`
			);
		} catch (err) {
			console.error(err);
		}
	} else if (command === "withdraw") {
		const amount = args[0];

		if (amount % 1 != 0 || amount <= 0)
			return message.channel.send(
				"Deposit amount must be a positive whole number"
			);

		try {
			if (amount > profileData.bank) {
				return message.channel.send(
					`You don't have ${amount} coins to withdraw`
				);
			}

			await Profile.findOneAndUpdate(
				{
					userID: message.author.id,
				},
				{
					$inc: {
						coins: amount,
						bank: -amount,
					},
				}
			);

			message.channel.send(
				`Successfully withdrew ${amount} coins from your bank`
			);
		} catch (err) {
			console.error(err);
		}
	}
});

client.login(token);
