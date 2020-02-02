module.exports = {
    name: 'radio',
    description: ["Lance une webradio"],
    alias: [],
    usage: ['[url]'],
    execute(message, data) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    let words = message.content.split(' ')
                    data[message.guild.id]['song'] = connection.playArbitraryInput(words[1])
                    data[message.guild.id]['song'].setVolume(1 / 25)
                    message.react('📻')
                }).catch(console.log)
        }
    }
}