module.exports = {
    name: 'resume',
    description: ["Reprend la musique mise en pause"],
    alias: [],
    usage: [''],
    execute(client, message, args, data) {
        if (message.member.voiceChannel) {
            message.react('⏯')
            data[message.guild.id]['song'].resume()
            data[message.guild.id]['song'].setSpeaking(true)
        }
    }
}