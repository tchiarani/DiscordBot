const Discord = require('discord.js')
const Attachment = require('discord.js')
const Canvas = require('canvas')

module.exports = {
    name: 'avatar',
    description: [""],
    aliases: ['icon'],
    usage: [''],
    async execute(message) {
        let background
        if (message.mentions.users.size) {
            const taggedUser = message.mentions.users.first()
            background = await Canvas.loadImage(taggedUser.avatarURL)
        } else {
            background = await Canvas.loadImage(message.author.avatarURL)
        }
        const canvas = Canvas.createCanvas(500, 500)
        const ctx = canvas.getContext("2d")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        const attachment = new Discord.Attachment(canvas.toBuffer(), "userAvatar.png")
        message.channel.send(attachment)
    }
}