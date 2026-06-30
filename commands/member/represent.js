module.exports = {
    data: {
        name: 'represent',
        description: 'Represent a user in the server',

        options: [
            {
                name: 'user_identifier',
                description: 'The user to represent',
                type: 3,
                required: true
            }
        ]
    },

    global: false,
    guildOnly: true,
    async execute(interaction, { component, flags }) {
        const userId = interaction.options.getString('user_identifier');
        flags.push(64);

        const reply = async (text) => {
            component.reset().text(text).separator(1);
            return interaction.reply({ components: [component], flags });
        };

        if (!interaction.guild) return reply('## Woah!\n\nPlease check I have the correct permissions and that this is executed within a server.');

        const user = (await interaction.client.discord.getUserRequest(interaction.guild.id, userId))?.body?.[0];
        const fetchUser = user
            ? await interaction.client.users.fetch(user.user.id).catch(() => null)
            : null;

        if (!user || !fetchUser) return reply(`## User Not Found\n\nThe userId you gave wasn't found, please make sure they have submitted an application to join this server.`);

        if (user.application_status !== "SUBMITTED") return reply(
            `## Already Represented\n\n${fetchUser.username} has already been accepted into **${interaction.guild.name}**, if you dont see them inside the server report this as a bug!\n\n` +
            `-# User was accepted on <t:${Math.floor(new Date(user.reviewed_at).getTime() / 1000)}:D>.`
        );

        const representUser = await interaction.client.discord.doRequest(interaction.guild.id, user.join_request_id);

        if (representUser?.status !== 200) return reply(`## Error Representing User\n\nThere was an error representing ${fetchUser.username}. Please try again later.`);

        flags.pop(); // remove the 64 (ephemeral)

        component.reset().text(
            `## Representing\n\nYou're now representing ${fetchUser.username}; they should have been accepted into the server!\n\n-# Please note: you can no longer undo this action.`
        ).separator(1).text(
            `-# Reviewed <t:${Math.floor(new Date(representUser.body.reviewed_at).getTime() / 1000)}:R>`
        );

        await interaction.reply({ components: [component], flags });

        component.reset().text(
            `## Application Accepted\n\nYou are now being represented by ${interaction.user.username} (${interaction.user.id}), who accepted your application to join **${interaction.guild.name}**!`
        ).separator(1).text(
            `-# Reviewed <t:${Math.floor(new Date(representUser.body.reviewed_at).getTime() / 1000)}:R>`
        );

        await fetchUser.send({ components: [component], flags: [64] }).catch(console.error);

        interaction.client.channels.cache?.get(interaction.client._channels.represent)?.send(
            `${fetchUser.username} (${fetchUser.id}) was represented by ${interaction.user.username} (${interaction.user.id}) on ${new Date().toISOString()}`
        );
    }
}
