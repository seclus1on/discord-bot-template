const fs = require('fs')
const { REST, Routes } = require('discord.js')

class Loader {
    constructor(client, log = () => { }) {
        this.client = client;
        this.loaded = { commands: false, events: false };
        this.log = log;
    }

    getFiles(base, ignore = []) {
        return fs.readdirSync(base)
            .filter(folder => !ignore.includes(folder))
            .flatMap(folder =>
                fs.readdirSync(`${base}/${folder}`)
                    .filter(file => file.endsWith(".js"))
                    .map(file => `${base}/${folder}/${file}`)
            );
    }

    async loadCommands() {
        if (this.loaded.commands) return "Commands have already been loaded."

        const base = `${__dirname}/../commands`

        for (const file of this.getFiles(base, ["_"])) {
            let cmd = require(file)

            cmd.data ??= {
                name: String(Math.random()).slice(2).toLowerCase(),
                description: "Not set."
            };

            cmd.execute ??= (i => i?.reply?.('This command is not implemented yet.') ?? null)

            this.client.commands.set(cmd.data.name, cmd)
        }

        await new REST({ version: '10' })
            .setToken(this.client.token)
            .put(
                Routes.applicationCommands(this.client.user.id),
                {
                    body: [...this.client.commands.values()].map(cmd => ({
                        ...cmd.data,
                        type: 1,
                        contexts: cmd.global ? [0, 1, 2] : [0],
                        dm_permission: true
                    }))
                }
            )

        this.log('info', `${this.client.commands.size} commands loaded`)

        this.loaded.commands = true

        return true;
    }

    loadEvents() {
        if (this.loaded.events) return "Events have already been loaded."

        const base = `${__dirname}/../events`

        for (const file of this.getFiles(base)) {
            const evt = require(file)

            this.client.events.set(evt.name, evt)

            const listener = evt.once ?
                this.client.once.bind(this.client) :
                this.client.on.bind(this.client)

            listener(evt.name, (...args) => { evt.execute(...args, this.client) })
        }

        this.log('debug', `loaded ${this.client.events.size} events`)

        this.loaded.events = true

        return true;
    }
}

module.exports = Loader