const Discord = require('discord.js')
const Canvas = require('canvas')

module.exports = {
    name: 'avatar',
    description: ["Affiche l'avatar d'un membre du serveur", "Affiche votre avatar"],
    alias: ['icon'],
    usage: ['[@membre]', ''],
    async execute(client, message, args, data) {
        let avatar
        if (message.mentions.users.size) {
            const taggedUser = message.mentions.users.first()
            avatar = await Canvas.loadImage(taggedUser.displayAvatarURL)
        } else {
            avatar = await Canvas.loadImage(message.author.displayAvatarURL)
        }
        const canvas = Canvas.createCanvas(256, 256)
        const ctx = canvas.getContext("2d")
        ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height)
        const attachment = new Discord.Attachment(canvas.toBuffer(), "userAvatar.png")
        message.channel.send(attachment)
    }
}