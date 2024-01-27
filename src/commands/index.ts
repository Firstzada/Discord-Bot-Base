import {
    ApplicationCommandOption,
    ApplicationCommandType,
    Channel,
    Client,
    Collection,
    CommandInteraction,
    Guild,
    GuildMember,
    GuildTextBasedChannel,
    Interaction,
    Message,
    REST,
    Routes,
    Snowflake,
    User,
} from "discord.js";
import * as glob from "glob";
import * as path from "path";
import { Command } from "./Command";
import "dotenv/config";

const rest = new REST().setToken(process.env.TOKEN || "");

type SlashCommand = {
    id?: Snowflake;
    type?: ApplicationCommandType;
    application_id: Snowflake;
    guild_id?: Snowflake;
    name: string;
    name_localizations?: any;
    description: string;
    description_localizations?: any;
    options: ApplicationCommandOption[];
    default_member_permissions?: string;
    dm_permission?: boolean;
    default_permission?: boolean;
    nsfw?: boolean;
    version?: Snowflake;
};

export class BotCommands {
    private readonly _client: Client;
    _commands: Collection<string, Command>;
    _slashs: SlashCommand[];

    constructor(client: Client) {
        this._commands = new Collection<string, Command>();
        this._client = client;
        this._slashs = [];
        this.loadCommands();
    }

    async handleInteractionCommand(interaction: Interaction) {
        if (!interaction.isCommand()) {
            return;
        }

        if (interaction.guildId) {
            if (
                interaction.channel &&
                interaction.channel.isTextBased() &&
                !interaction.channel.isDMBased()
            ) {
                this.handleCommand(
                    interaction.client,
                    interaction.guild,
                    interaction.user,
                    interaction.channel,
                    interaction.commandName,
                    interaction
                );
            }
        }
    }

    loadCommands() {
        const commandFiles = glob.sync("**/*.ts", {
            cwd: path.join(__dirname, ""),
        });

        for (const file of commandFiles) {
            if (file == "Command.ts" || file == "index.ts") continue;
            const { Cmd } = require(path.join(__dirname, file));
            if (typeof Cmd == "function") {
                const command: Command = new Cmd();
                if (command.enabled === true) {
                    this._commands.set(command.name, command);
                    if (command.slash) {
                        this._slashs.push({
                            name: command.name,
                            name_localizations: command.name_localizations,
                            description_localizations: command.description_localizations,
                            application_id: this._client.user?.id || "",
                            guild_id: process.env.MAIN_GUILD_ID || "",
                            description: command.description,
                            options: command.options,
                        });
                    }
                }
            }
        }

        rest.put(
            Routes.applicationGuildCommands(
                this._client.user?.id || "",
                process.env.MAIN_GUILD_ID || ""
            ),
            { body: this._slashs }
        );
    }

    handleCommand(
        client: Client,
        guild: Guild | null,
        user: User,
        channel: GuildTextBasedChannel | null,
        commandName: string,
        data: string[] | CommandInteraction
    ) {
        let command = this._commands.get(commandName);

        if (!command) {
            this._commands.forEach((cmd) => {
                if (cmd.aliases && cmd.aliases.includes(commandName)) {
                    command = cmd;
                }
            });
        }

        if (!command) {
            return;
        }

        if (channel && !channel.isDMBased() && channel.isTextBased()) {
            const permissionsBot = channel.permissionsFor(client.user?.id || "");
            if (!permissionsBot || !channel.viewable) {
                return;
            }
            if (
                Array.isArray(command.bot_permissions) &&
                command.bot_permissions.length > 0
            ) {
                for (const permission of command.bot_permissions) {
                    if (!permissionsBot.has(permission)) {
                        // Missing "permission" to execute command (BOT)
                        return;
                    }
                }
            }

            // Permissions for who Executed
            const permissionsUser = channel.permissionsFor(user.id);
            if (!permissionsUser) {
                return;
            }
            if (
                Array.isArray(command.user_permissions) &&
                command.user_permissions.length > 0
            ) {
                for (const permission of command.user_permissions) {
                    if (!permissionsBot.has(permission)) {
                        // Missing "permission" to execute command (USER)
                        return;
                    }
                }
            }
        }

        command.execute(client, guild, user, channel, data);
    }

    async onMessage(
        client: Client,
        channel: Channel,
        member: GuildMember | null,
        message: Message
    ): Promise<void> {
        const content = message.content;
        const prefix = process.env.PREFIX || "!";
        if (!content.toLowerCase().startsWith(prefix.toLowerCase())) {
            return;
        }

        const args = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
            if (channel.isTextBased() && !channel.isDMBased()) {
                message.delete().catch(() => { });
                this.handleCommand(
                    client,
                    message.guild,
                    message.author,
                    channel,
                    commandName,
                    args
                );
            }
        }
    }
}