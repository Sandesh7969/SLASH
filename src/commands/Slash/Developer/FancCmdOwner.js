const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "owner-help",
  description: "Display all commands for the owner.",
  category: "Developer",
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
    owner: true,
    premium: false,
  },
  run: async (client, interaction) => {
    // Defer the interaction to prevent timeouts
    await interaction.deferReply({ ephemeral: false });

    // Define premium and developer commands for better readability
    const premiumCommands = [
      "f?generate : Generate premium user code.",
      "f?unpremium : Delete user from premium.",
      "f?list : Get list of all premium users.",
    ].join("\n");

    const developerCommands = [
      "f?ban : Ban a user from using the bot.",
      "f?maintenance : Enable maintenance mode.",
      "f?eval : Bot evaluation.",
    ].join("\n");

    // Build the embed with a more professional and organized structure
    const embed = new EmbedBuilder()
      .setTitle("Owner Commands")
      .setDescription(`
        <:Premium:1202299422705463398> **Premium Commands**
        \`\`\`yaml
        ${premiumCommands}
        \`\`\`

        <:developer:1202299625277759488> **Developer Commands**
        \`\`\`yaml
        ${developerCommands}
        \`\`\`
      `)
      .setColor(client.color)
      .setURL("https://discord.gg/GPzYFx7zfe"); // Replace with your actual support server URL

    // Send the edited reply with the embed
    return interaction.editReply({ embeds: [embed] });
  },
};
