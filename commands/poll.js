const Discord = require('discord.js')

const emojisNombre = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

module.exports = {
    name: 'poll',
    description: ["Crée un sondage"],
    aliases: ['sondage'],
    usage: ['[Question ? "Choix 1" "Choix 2" ... ]'],
    execute(message, args, data) {
        let question = message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf("?") + 1)
        let choices = message.content.substring(message.content.indexOf("?") + 2, message.content.length + 1).replace(/"/gi, '').split(' ')
        if (question[1] == undefined || choices[1] == undefined || choices.length > 9) {
            message.reply('il ne peut pas y avoir plus de 9 choix de réponses.')
            return
        }
        const pollEmbed = new Discord.RichEmbed()
            .setColor(0xffffff)
            .setAuthor("Sondage crée par " + message.author.username)
            .setTitle(question)
            .setDescription(choices.map((value, index) => emojisNombre[index] + ' ' + value).join('\n'))
            .setFooter("Réagissez pour voter")
        message.channel.send(pollEmbed)
            .then(async function(poll) {
                for (let i = 0; i < choices.length; i++) {
                    await poll.react(emojisNombre[i])
                }
            }).catch(console.log())
    }
}