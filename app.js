require("dotenv").config();
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const axios = require("axios").default;
const fs = require("fs");
const path = require("node:path");
const mongoose = require("mongoose");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
});

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

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const token = process.env.DISCORD_TOKEN;

async function mongooseSetup() {
	await mongoose.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.r10bh.mongodb.net/dev?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		}
	);
}

mongooseSetup();

client.login(token);

// client.on(Events.MessageCreate, async (message) => {
// 	if (command === "daily") {
// 		let coolDown = 86400000;
// 		let lastDaily = profileData.lastDaily || 0;
// 		if (Date.now() - lastDaily > coolDown) {
// 			const amount = 500;
// 			await Profile.findOneAndUpdate(
// 				{
// 					userID: message.author.id,
// 				},
// 				{
// 					$inc: {
// 						coins: amount,
// 					},
// 					lastDaily: Date.now(),
// 				}
// 			);

// 			message.channel.send(`You received your daily of ${amount} coins`);
// 		} else {
// 			message.channel.send(
// 				`Too soon, you can get daily again in ${msToTime(
// 					coolDown - (Date.now() - profileData.lastDaily)
// 				)}`
// 			);
// 		}
// 	} else if (command === "deposit") {
// 		const amount = args[0];

// 		if (amount % 1 != 0 || amount <= 0)
// 			return message.channel.send(
// 				"Deposit amount must be a positive whole number"
// 			);

// 		try {
// 			if (amount > profileData.coins) {
// 				return message.channel.send(
// 					`You don't have ${amount} coins to deposit`
// 				);
// 			}

// 			await Profile.findOneAndUpdate(
// 				{
// 					userID: message.author.id,
// 				},
// 				{
// 					$inc: {
// 						coins: -amount,
// 						bank: amount,
// 					},
// 				}
// 			);

// 			message.channel.send(
// 				`Successfully deposited ${amount} coins into your bank`
// 			);
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	} else if (command === "withdraw") {
// 		const amount = args[0];

// 		if (amount % 1 != 0 || amount <= 0)
// 			return message.channel.send(
// 				"Deposit amount must be a positive whole number"
// 			);

// 		try {
// 			if (amount > profileData.bank) {
// 				return message.channel.send(
// 					`You don't have ${amount} coins to withdraw`
// 				);
// 			}

// 			await Profile.findOneAndUpdate(
// 				{
// 					userID: message.author.id,
// 				},
// 				{
// 					$inc: {
// 						coins: amount,
// 						bank: -amount,
// 					},
// 				}
// 			);

// 			message.channel.send(
// 				`Successfully withdrew ${amount} coins from your bank`
// 			);
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	}
// });
