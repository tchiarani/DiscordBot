module.exports = {
    name: 'skip',
    description: 'Passe à la musique suivante',
    execute(message, data) {
        console.log(message)
        console.log(message.member)
        message.member.voiceChannel.join()
            .then(connection => {
                message.react('⏭')
                end(connection, message, "Skip")
            }).catch(console.log)

        function end(connection, message, action) {
            if (action != "Skip end") {
                data[message.guild.id]['song'].end([action])
            }
            if (action == 'Skip' || action == "Skip end") {
                data[message.guild.id]['queue'].shift()
                data[message.guild.id]['dataQueue'].shift()
                data[message.guild.id]['dataMusicEmbed'].shift()
                data[message.guild.id]['musicTitle'].shift()
                data[message.guild.id]['musicDuration'].shift()
            } else if (action == 'Stop') {
                data[message.guild.id]['queue'] = []
                data[message.guild.id]['dataQueue'] = []
                data[message.guild.id]['dataMusicEmbed'] = []
                data[message.guild.id]['musicTitle'] = []
                data[message.guild.id]['musicDuration'] = []
            }
            if (data[message.guild.id]['queue'].length == 0) {
                connection.disconnect()
            } else {
                play(connection, message, 'Skip')
            }
        }
    }
}