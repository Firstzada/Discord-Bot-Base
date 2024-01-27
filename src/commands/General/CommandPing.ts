import { Client, CommandInteraction, Guild, GuildTextBasedChannel, PermissionsBitField, User } from 'discord.js';
import { Command } from "../Command";
export class Cmd extends Command {

    constructor() {
        super("ping", { "pt-BR": "ping" }, "Get 'pong' response.", [PermissionsBitField.Flags.SendMessages], [/*user_bot_permissions*/], [PermissionsBitField.Flags.SendMessages], ["p"]);
        this.options = [];
        this.enabled = true;
        this.description_localizations = { "pt-BR": "Receba 'pong' como resposta." }
    }

    async execute(client: Client, guild: Guild, user: User, channel: GuildTextBasedChannel, data: CommandInteraction | string[]) {

        const isSlash = data instanceof CommandInteraction;

        if (isSlash) {
            data.reply({ content: 'pong', ephemeral: true });
            return;
        }

        channel.send({ content: 'pong' });
    }
}