const Discord = require('discord.js')
const Canvas = require('canvas')

module.exports = {
    name: 'avatar',
    description: ["Affiche l'avatar d'un membre du serveur", "Affiche votre avatar"],
    alias: ['icon'],
    usage: ['[membre]', ''],
    async execute(client, message, args, data) {
        let background
        if (message.mentions.users.size) {
            const taggedUser = message.mentions.users.first()
            console.log(taggedUser.displayAvatarURL.height)
            console.log(taggedUser.displayAvatarURL.size)
            background = await Canvas.loadImage(taggedUser.displayAvatarURL)
        } else {
            background = await Canvas.loadImage(message.author.displayAvatarURL)
            console.log(message.author.displayAvatarURL)
            console.log(message.author.avatarURL)
        }
        const canvas = Canvas.createCanvas(500, 500)
        const ctx = canvas.getContext("2d")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        const attachment = new Discord.Attachment(canvas.toBuffer(), "userAvatar.png")
        message.channel.send(attachment)
    }
}