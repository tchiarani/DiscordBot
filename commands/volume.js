module.exports = {
    name: 'volume',
    description: ["Règle le volume entre 0 et 200", "Affiche le volume actuel"],
    alias: ['vol', 'v'],
    usage: ['[chiffre]', ''],
    execute(client, message, args, data) {
        if (args.length === 0) {
            if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
                message.channel.send("🔊 Volume : " + data[message.guild.id]['song'].volume)
            } else {
                message.channel.send("Aucune musique dans la file d'attente")
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