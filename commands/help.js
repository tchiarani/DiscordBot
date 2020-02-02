const Discord = require('discord.js')
const config = require('./../config')

module.exports = {
    name: 'help',
    description: "Affiche toutes les commandes ou des informations à propos d'une commande",
    aliases: ['commandes', 'commands'],
    usage: '[commande]',
    execute(message, args) {
        const { commands } = message.client
        console.log(commands)

        if (!args.length) {

            let dataHelp = new Discord.RichEmbed()
                .setTitle("Liste des commandes")
                .setDescription("Préfix : **" + config.prefix + "**")
                .setAuthor("Besoin d'aide ?", config.botAvatar, "https://unikorn.ga/bot")
                .setColor('#7289DA')
                .setFooter("unikorn.ga | /help", config.authorAvatar)
                .addField("----------------", commands.map(command => config.prefix + command.name).slice(0, (commands.size + 1) / 2).join("\n" + config.prefix), true)
                .addField("----------------", commands.map(command => config.prefix + command.name).slice((commands.size + 1) / 2, commands.size).join("\n" + config.prefix), true)
            message.channel.send(dataHelp)

        } else {
            const name = args[0].toLowerCase()
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

            if (!command) {
                return message.reply('that\'s not a valid command!')
            }

            data.push(`**Name:** ${command.name}`)

            if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`)
            if (command.description) data.push(`**Description:** ${command.description}`)
            if (command.usage) data.push(`**Usage:** ${config.prefix}${command.name} ${command.usage}`)

            data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`)

            message.channel.send(data, { split: true })
        }
    }
}