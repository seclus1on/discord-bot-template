module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with Pong!',

        options: [
            {
                name: 'message',
                description: 'The message to send',
                type: 3,
                required: false
            }
        ]
    },

    global: true,
    async execute(interaction) {
        await interaction.reply(interaction.options.get('message')?.value ?? "No message provided");
    }
}