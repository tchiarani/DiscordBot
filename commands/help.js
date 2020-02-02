const Discord = require('discord.js')
const config = require('./../config')

module.exports = {
    name: 'help',
    description: ["Affiche toutes les commandes", "Affiche des informations à propos d'une commande"],
    alias: ['aide'],
    usage: ['', 'commande'],
    execute(message, args, data) {
        const { commands } = message.client

        if (!args.length) {

            let dataHelp = new Discord.RichEmbed()
                .setTitle("Liste des commandes")
                .setDescription("Préfix : **" + config.prefix + "**")
                .setAuthor("Besoin d'aide ?", config.botAvatar, "https://unikorn.ga/bot")
                .setColor('#7289DA')
                .setFooter("unikorn.ga | /help", config.authorAvatar)
                .addField("----------------", commands.map(command => config.prefix + command.name).slice(0, (commands.size + 1) / 2).join("\n"), true)
                .addField("----------------", commands.map(command => config.prefix + command.name).slice((commands.size + 1) / 2, commands.size).join("\n"), true)
            message.channel.send(dataHelp)

        } else {
            const name = args[0].toLowerCase()
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

            if (!command) {
                return message.reply('cette commande n\'existe pas')
            }

            data[message.guild.id]['specificHelpEmbed'] = new Discord.RichEmbed()
                .setTitle("Commandes disponibles pour " + config.prefix + command.name + " :")
                .setAuthor("Besoin d'aide ?⁢⁢", config.botAvatar, "https://unikorn.ga/bot")
                .setColor('#7289DA')
                .setFooter("unikorn.ga | " + config.prefix + "help " + command.name, config.authorAvatar)
            if (command.usage) data[message.guild.id]['specificHelpEmbed'].addField("**Commande :**", config.prefix + ' ' + command.name + ' *' + command.usage.join("*\n*" + config.prefix + command.name) + '*', true)
            if (command.description) data[message.guild.id]['specificHelpEmbed'].addField("**Description :**", command.description.join("\n"), true)
            if (command.alias) {
                data[message.guild.id]['specificHelpEmbed'].setDescription("Alias : " + config.prefix + command.alias.join(", " + config.prefix))
            } else {
                data[message.guild.id]['specificHelpEmbed'].setDescription("Aucun alias")
            }

            message.channel.send(data[message.guild.id]['specificHelpEmbed'])
        }
    }
}