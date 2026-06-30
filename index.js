const { Client, GatewayIntentBits } = require('discord.js')

const Loader = require('./classes/Loaders')
const DiscordEndpoints = require('./classes/DiscordEndpoints')
const config = require('./data/config.json')

const client = new Client({ intents: Object.values(GatewayIntentBits) })
client.startTime = Date.now()

client.events = new Map()
client.commands = new Map()

client.loader = new Loader(client)
client.loader.loadEvents() // commands are loaded inside of ready event './events/init/ready.js'

client.discord = new DiscordEndpoints(config?.selfbotToken ?? null)
// we need to use a selfbot token as the endpoint is user tokens only.

client._channels = config?.channels ?? {}

client.login(config.token)
