module.exports = {
    name: 'skip',
    description: 'Passe à la musique suivante',
    execute(message, data) {
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

        function play(connection, message, action) {
            if (action == "Add") {
                if (data[message.guild.id]['queue'].length > 1) {
                    message.channel.send('Ajoutée : **' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (' + data[message.guild.id]['firstResult'].timestamp + ')')
                }
            } else if (action == "Add playlist") {
                if (data[message.guild.id]['queue'].length > 1) {
                    message.channel.send('Playlist ajoutée : **' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (**' + data[message.guild.id]['firstResult'].items.length + '** musiques)')
                }
            }
            if (action == "Add" && data[message.guild.id]['queue'].length <= 1 || action == "Skip" && data[message.guild.id]['queue'].length >= 1) {
                message.channel.send(data[message.guild.id]['dataMusicEmbed'][0])
                data[message.guild.id]['song'] = connection.playStream(ytdl(data[message.guild.id]['queue'][0]))
                data[message.guild.id]['song'].setVolume(1 / 25)

                data[message.guild.id]['song'].on("end", (reason) => {
                    if (reason == undefined) {
                        end(connection, message, "Stop")
                    } else if (reason != "Skip") {
                        end(connection, message, "Skip end")
                    }
                })
            }
        }
    }
}