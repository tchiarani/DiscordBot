module.exports = {
    name: 'volume',
    description: "",
    aliases: ['vol', 'v'],
    usage: '<chiffre>',
    execute(message, args, data) {
        if (args.length === 0) {
            if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
                message.reply("🔊 Volume : " + data[message.guild.id]['song'].volume)
            } else {
                message.reply("Aucune musique dans la file d'attente")
            }
        } else {
            if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
                let words = message.content.split(' ')
                if (words[1] >= 0 && words[1] <= 200) {
                    data[message.guild.id]['song'].setVolume(words[1] / 2500)
                    message.react('🔊')
                } else {
                    message.channel.send('Fais pas l\'fou gamin ! ' + words[1] + ' c\'est trop fort...')
                    message.react('🛑')
                }
            }
        }
    }
}