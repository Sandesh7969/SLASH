const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const { readdirSync } = require("fs");
const { supportUrl, inviteUrl, voteUrl } = require("../../../settings/config.js");

module.exports = {
    name: "help",
    description: "Display all commands of the bot.",
    category: "Information",
    permissions: {
        bot: [],
        channel: [],
        user: [],
    },
    settings: {
        inVc: false,
        sameVc: false,
        player: false,
        current: false,
        owner: false,
        premium: false,
    },
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const row2 = new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setLabel("Sponsor").setURL('https://youtube.com/@Supreme-guide?si=S2Z0sK108l_RgfuH').setStyle(ButtonStyle.Link))
            .addComponents(new ButtonBuilder().setLabel("Support Server").setURL(supportUrl).setStyle(ButtonStyle.Link));

        const categories = readdirSync("./src/commands/Slash/");

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.guild.members.me.displayName} Help Panel! 💖`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setColor(client.color)
            .setDescription(
                `👋🏻 **${interaction.member}**, Myself **${client.user}** \n\n<:F_arrow:1202298696620834856> **${client.user.username}**\n**An Advanced Discord MusicBot with User-Friendly Interface. I Promise you that I will try my Best to Give you the beat of Music Clearly.** \n\n<:stats:1202391860140572773> **__Category Fancy__**\n<:info:1202392774788526100>  **Information**\n<:music:1202393441548505128>  **Music**\n<:Premium:1202299422705463398> **Premium**\n<:developer:1202299625277759488>  **Developer**\n<:filters:1202394103426457682> **Filters**\n\n<:ping:1202394451075534908> **__Status__:  ${client.user.username}**\n<:servers:1202394899253842120>  Servers: **${client.guilds.cache.size}**\n<:ping:1202394451075534908>  Ping: **${Math.round(client.ws.ping)}ms**\n`
            )
            .setFooter({
                text: `Made with 💖 by Supreme`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId("help-category")
                .setPlaceholder(`Fancy Commands`)
                .setMaxValues(1)
                .setMinValues(1)
                .setOptions(
                    categories.map((category) => {
                        return new StringSelectMenuOptionBuilder().setLabel(category).setValue(category);
                    })
                ),
        ]);

        interaction.editReply({ embeds: [embed], components: [row, row2] }).then(async (msg) => {
            let filter = (i) => i.isStringSelectMenu() && i.user && i.message.author.id == client.user.id;

            let collector = await msg.createMessageComponentCollector({
                filter,
                time: 90000,
            });

            collector.on("collect", async (m) => {
                if (m.isStringSelectMenu()) {
                    if (m.customId === "help-category") {
                        await m.deferUpdate();

                        let [directory] = m.values;

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.guild.members.me.displayName} Help Command!`,
                                iconURL: interaction.guild.iconURL({ dynamic: true }),
                            })
                            .setDescription(
                                `\ \n\n**\<:F_arrow:1202298696620834856> ${
                                    directory.slice(0, 1).toUpperCase() + directory.slice(1)
                                } Commands:**\n${client.slashCommands
                                    .filter((c) => c.category === directory)
                                    .map((c) => `\`${c.name}\` : *${c.description}*`)
                                    .join("\n")}`
                            )
                            .setColor(client.color)
                            .setFooter({
                                text: `Made with 💖 by Supreme| Total Commands: ${
                                    client.slashCommands.filter((c) => c.category === directory).size
                                }`,
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setTimestamp();

                        msg.edit({ embeds: [embed] });
                    }
                }
            });

            collector.on("end", async (collected, reason) => {
                if (reason === "time") {
                    const timed = new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.guild.members.me.displayName} Help Panel! 💖`,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                        })
                        .setDescription(
                            `Please use /help again for Checking Commands`
                        )
                        .setColor(client.color)
                        .setFooter({
                            text: `Join Support For Premium`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setTimestamp();

                    msg.edit({ embeds: [timed], components: [row2] });
                }
            });
        });
    },
};
