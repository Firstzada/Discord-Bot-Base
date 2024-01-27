import { ActivityType, BitFieldResolvable, ChannelType, Client, GatewayIntentsString, IntentsBitField, PermissionsBitField } from "discord.js";
import { BotCommands } from "./src/commands/index";
import 'dotenv/config'
import { startLog } from "./src/utils/logUtils";
import { ServerListener } from "./src/events/ServerListener";
import fs from 'fs';

async function main() {
    const client = new Client({
        intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, number>
    });

    await client.login(process.env.TOKEN);

    const serverListener = new ServerListener();
    const botCommands = new BotCommands(client);

    client.on("messageCreate", async (message) => {
        if (message && message.guildId && message.guild?.available === true) {
            if (
                message.channel &&
                message.channel.isTextBased() &&
                !message.channel.isDMBased()
            ) {
                const permissions = message.channel.permissionsFor(
                    client.user?.id || ""
                );

                if (
                    !permissions ||
                    !permissions.has(PermissionsBitField.Flags.SendMessages) ||
                    !message.channel.viewable
                ) {
                    return;
                }

                botCommands.onMessage(
                    client,
                    message.channel,
                    message.member,
                    message
                );
            }
        }
    });

    client.on("guildMemberRemove", (guildMember) => {
        if (guildMember.guild.available === true) {
            serverListener.guildMemberRemove(guildMember.client, guildMember);
        }
    });

    client.on("guildMemberAdd", (guildMember) => {
        if (guildMember.guild.available === true) {
            serverListener.guildMemberAdd(guildMember.client, guildMember.guild, guildMember);
        }
    });

    client.on("interactionCreate", (interaction) => {
        if (interaction && interaction.guild && interaction.guild.available === true) {
            botCommands.handleInteractionCommand(interaction);
        }
    });

    client.on("ready", async () => {
        client.user?.setPresence({ activities: [{ name: `fxrst`, type: ActivityType.Listening }], status: 'idle' });
    })

    // InstagramManager.generateWebhook();
    startLog(client.user?.tag || "", process.env.PREFIX || "!", botCommands._commands.size, botCommands._slashs.length);
}

process.on("uncaughtException", function (err: Error) {
    console.error(err);
    fs.appendFileSync("./errors.txt", err.stack + "\n\n", { encoding: 'utf8' });
});

main();