const componentBuilder = require("../../classes/component");
const { guildID } = require('../../data/config.json')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        const component = new componentBuilder();

        for (const check of [
            {
                message: "This command is a crashing-LTD only command, please don't try to use it anywhere else!",
                condition: () => command.guildOnly && (!interaction.guild || interaction.guild.id !== guildID)
            }
        ]) {
            if (check.condition()) return await interaction.reply({ content: check.message, flags: 64 });
        }

        try {
            await command.execute(interaction, { component, flags: [(1 << 15)] });
        } catch (error) {
            console.error(error);

            interaction.deferred ?
                interaction.followUp({ content: 'There was an error executing this command!', flags: 64 }) :
                interaction?.reply?.({ content: 'There was an error executing this command!', flags: 64 });
        }
    }
}