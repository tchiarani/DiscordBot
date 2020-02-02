module.exports = {
    name: 'pause',
    description: ["Met la musique en pause"],
    aliases: [],
    usage: [''],
    execute(message, args, data) {
        if (message.member.voiceChannel) {
            message.react('⏸')
            data[message.guild.id]['song'].pause()
            data[message.guild.id]['song'].setSpeaking(false)
        }
    }
}