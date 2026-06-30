module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Invite https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);

        await client.discord.init()
        await client.loader.loadCommands()

        console.log(`DiscordEndpoint class logged in as ${client.discord.user.username} (${client.discord.user.id})`)
        console.log(`StartUp took ${Date.now() - client.startTime}ms`)
    }
}