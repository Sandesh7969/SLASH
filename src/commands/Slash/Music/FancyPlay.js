const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const formatDuration = require("../../../structures/FormatDuration.js");

module.exports = {
    name: "play",
    description: "Play your favorite song/s.",
    category: "Music",
    options: [
        {
            name: "query",
            description: "Provide song name/url.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    permissions: {
        bot: ["Speak", "Connect"],
        channel: ["Speak", "Connect"],
        user: [],
    },
    settings: {
        inVc: true,
        sameVc: false,
        player: false,
        current: false,
        owner: false,
        premium: false,
    },
    run: async (client, interaction) => {
        const song = interaction.options.getString("query");

        let player = client.poru.players.get(interaction.guild.id);

        if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`\<a:wrong_kastro:1191703733457911820>\ | You must be on the same voice channel as mine to use this command.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });

        // This will force the playSource config to be set as 'spotify' if the config.js or .env file has 'disableYouTube' set to 'true' and the playSource value you set in the config.js is one of the constants in the 'youtube' array below.
        let source = client.config.playSource;

        const youtube = ["youtube", "youtube_music", "ytsearch", "ytmsearch", "youtubemusic", "youtube music"];

        if (client.config.disableYouTube === true && youtube.includes(source)) source = "spotify";
        // This will not prevent the user to use a direct youtube url!!!
        // if you want to pass a "return" response to the user when you disable youtube, do some searching on the internet for how to do that!!!

        if (!player) {
            player = await client.poru.createConnection({
                guildId: interaction.guild.id,
                voiceChannel: interaction.member.voice.channel.id,
                textChannel: interaction.channel.id,
                region: interaction.member.voice.channel.rtcRegion || undefined,
                deaf: true,
            });
        }

        const res = await client.poru.resolve(song, source); // <<== you can remove this "source" property for default ytsearch source. see config.js for details.
        const { loadType, tracks, playlistInfo } = res;

        if (player.state !== "CONNECTED") player.connect();

        if (player.state !== "CONNECTED") player.connect();

        if (loadType === "PLAYLIST_LOADED") {
            for (const track of res.tracks) {
                track.info.requester = interaction.member;
                await player.queue.add(track);
            }

            const track = tracks.shift();

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`<a:tick_kastro:1191703538485702727> | **[${playlistInfo.name}](${song})** • \`${tracks.length}\` tracks • ${track.info.requester}`);

            await interaction.editReply({ embeds: [embed] });
            if (!player.isPlaying && !player.isPaused) return player.play();
        } else if (loadType === "SEARCH_RESULT" || loadType === "TRACK_LOADED") {
            const track = tracks.shift();

            track.info.requester = interaction.member;
            await player.queue.add(track);

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(
                    `<<a:tick_kastro:1191703538485702727> | **[${track.info.title ? track.info.title : "Unknown"}](${track.info.uri})** • \`${
                        track.info.isStream ? "LIVE" : formatDuration(track.info.length)
                    }\` • ${track.info.requester}`,
                );

            await interaction.editReply({ embeds: [embed] });
            if (!player.isPlaying && !player.isPaused) return player.play();
        } else if (loadType === "LOAD_FAILED" || loadType === "NO_MATCHES") {
            const embed = new EmbedBuilder().setColor(client.color).setDescription(`\`<:icon_cross:1200797307805892651>\` | Song was no found or Failed to load song!`);

            return interaction.editReply({ embeds: [embed] });
        }
    },
};
