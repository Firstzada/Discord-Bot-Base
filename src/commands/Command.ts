import {ApplicationCommandOption, Client, CommandInteraction, Guild, GuildTextBasedChannel, User } from 'discord.js';

export abstract class Command {
    name: string;
    name_localizations: any;
    description: string;
    user_permissions: bigint[];
    user_bot_permissions: string[];
    bot_permissions: bigint[];
    cooldownToUse: number;
    cooldownType: string;
    enabled: boolean;
    slash: boolean;
    description_localizations: any;
    options: ApplicationCommandOption[];
    aliases: string[];

    constructor(
        name: string,
        name_localizations: any,
        description: string,
        user_permissions: bigint[],
        user_bot_permissions: string[],
        bot_permissions: bigint[],
        aliases: string[],
    ) {
        this.name = name;
        this.name_localizations = name_localizations;
        this.description = description;
        this.user_permissions = user_permissions;
        this.user_bot_permissions = user_bot_permissions;
        this.bot_permissions = bot_permissions;
        this.cooldownToUse = 0;
        this.cooldownType = 'global';
        this.enabled = true;
        this.slash = true;
        this.description_localizations = {};
        this.options = [];
        this.aliases = aliases;
    }

    abstract execute(client: Client, guild: Guild | null, user: User, channel: GuildTextBasedChannel | null, data: CommandInteraction | string[]): Promise<void> | void;
}