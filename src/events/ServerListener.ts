import Discord, { AuditLogEvent, Message, Options, TextChannel } from "discord.js";

export class ServerListener {
    constructor() { }

    async guildMemberAdd(
        client: Discord.Client,
        guild: Discord.Guild,
        guildMember: Discord.GuildMember
    ): Promise<any> {
        const generalChat = client.channels.cache.get("id_do_canal");
        if (generalChat instanceof TextChannel) {
            generalChat.send({ content: `Bem vindo ${guildMember}!` })
        }
    }

    async guildMemberRemove(
        client: Discord.Client,
        guildMember: Discord.GuildMember | Discord.PartialGuildMember
    ): Promise<any> {
        const logChannel = client.channels.cache.get("id_do_canal");
        if (logChannel instanceof TextChannel) {
            logChannel.send({ content: `${guildMember} saiu do servidor!` })
        }
    }
}