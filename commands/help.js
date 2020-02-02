const Discord = require('discord.js')
const config = require('./../config')

module.exports = {
    name: 'help',
    description: "Affiche toutes les commandes ou des informations à propos d'une commande",
    aliases: ['commandes', 'commands'],
    usage: '[commande]',
    execute(message, args) {
        const data = []
        const { commands } = message.client

        if (!args.length) {
            data.push('Here\'s a list of all my commands:')
            data.push(commands.map(command => command.name).join(', '))
            data.push(`\nYou can send \`${config.prefix}help [command name]\` to get info on a specific command!`)

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return
                    message.reply('I\'ve sent you a DM with all my commands!')
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error)
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?')
                })

            let dataHelp = new Discord.RichEmbed()
                .setTitle("Liste des commandes")
                .setDescription("Préfix : **" + config.prefix + "**")
                .setAuthor("Besoin d'aide ?", config.botAvatar, "https://unikorn.ga/bot")
                .setColor('#7289DA')
                .setFooter("unikorn.ga | /help", config.authorAvatar)
                .addField("----------------", config.prefix + commands.map(command => command.name).slice(0, (commands.length + 1) / 2).join("\n" + config.prefix), true)
                .addField("----------------", config.prefix + commands.map(command => command.name).slice((commands.length + 1) / 2, commands.length).join("\n" + config.prefix), true)
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