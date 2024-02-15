const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Replies with tracking!'),
	async execute(interaction) {
		await interaction.reply('tracking!');
	},
};