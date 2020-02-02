module.exports = {
    name: 'poll',
    description: "",
    aliases: ['sondage'],
    usage: '',
    execute(message, emojisNombre) {
        let question = contenuMessage.substring(message.content.indexOf(" ") + 1, message.content.indexOf("?") + 1)
        let choices = contenuMessage.substring(message.content.indexOf("?") + 2, message.content.length + 1).replace(/"/gi, '').split(' ')
        if (question[1] == undefined || choices[1] == undefined || choices.length > 9) {
            message.reply('Utilisation :\n' + config.prefix + 'poll Faut-il poser une question ? "Oui" "Non"')
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