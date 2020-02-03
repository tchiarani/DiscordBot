const Discord = require('discord.js')
const config = require('./../config')

module.exports = {
    name: 'queue',
    description: ["Affiche la file d'attente"],
    usage: ['[chiffre]'],
    alias: ['q'],
    execute(message, args, data) {
        if (args.length == 0) {
            if (data[message.guild.id]['dataQueue'].length != 0) {
                setQueueEmbed(message, data[message.guild.id]['musicTitle'], data[message.guild.id]['musicDuration'])
            } else {
                message.channel.send("Aucune musique dans la file d'attente.")
            }
        } else {
            const queueNumber = message.content.substring(message.content.indexOf(" ") + 1, message.content.length + 1)
            if (queueNumber >= 0 && queueNumber <= 1000) {
                if (data[message.guild.id]['dataQueue'][queueNumber] != undefined) {
                    if (queueNumber == 0) {
                        message.channel.send('🔊 ' + data[message.guild.id]['dataQueue'][queueNumber])
                    } else if (queueNumber <= 9) {
                        message.channel.send(queueNumber + '. ' + data[message.guild.id]['dataQueue'][queueNumber])
                    } else {
                        message.channel.send(queueNumber + '. ' + data[message.guild.id]['dataQueue'][queueNumber])
                    }
                } else {
                    message.channel.send("Pas ce numéro dans la file d'attente.")
                }
            } else {
                message.channel.send("La valeur doit être comprise entre 1 et 1000.")
            }
        }


        function setQueueEmbed(message, musicTitle, musicDuration) {
            let nbPages = Math.ceil(musicTitle.length / config.maxQueueDisplay)
            let page = 1
            let indexMin = 1
            let indexMax = config.maxQueueDisplay + 1
            data[message.guild.id]['queueEmbed'] = new Discord.RichEmbed()
                .setTitle("File d'attente :")
                .setColor('#FF0000')
                .addField("Actuellement :", "🔊 **" + musicTitle[0] + "**", false)
            if (musicTitle.length == 1) {
                data[message.guild.id]['queueEmbed'].setFooter("1 musique")
            } else {
                data[message.guild.id]['queueEmbed'].addField("Prochainement :", musicTitle.slice(indexMin, indexMax).map((value, index) => index + 1 + '. **' + value).join('**\n') + "**", true)
                data[message.guild.id]['queueEmbed'].addField("Durée :", musicDuration.slice(indexMin, indexMax), true)
                if (nbPages == 1) {
                    data[message.guild.id]['queueEmbed'].setFooter(musicTitle.length + " musiques")
                } else {
                    data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
                }
            }
            message.channel.send(data[message.guild.id]['queueEmbed'])
                .then(msg => {
                    if (musicTitle.length > config.maxQueueDisplay) {
                        msg.react('⬅️').then(res => {
                            msg.react('➡️')

                            const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' //&& user.id === message.author.id
                            const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' //&& user.id === message.author.id

                            const backwards = msg.createReactionCollector(backwardsFilter)
                            const forwards = msg.createReactionCollector(forwardsFilter)

                            backwards.on('collect', r => {
                                if (r.users[1]) r.remove(r.users.filter(u => !u.bot))
                                if (r.count == 1 || page == 1) return
                                page--
                                nbPages = Math.ceil(musicTitle.length / 10)
                                indexMin -= config.maxQueueDisplay
                                indexMax -= config.maxQueueDisplay
                                if (musicTitle[0]) data[message.guild.id]['queueEmbed'].fields[0].value = "🔊 **" + musicTitle[0] + "**"
                                if (musicTitle.length == 1) {
                                    data[message.guild.id]['queueEmbed'].fields[1].value = " "
                                    data[message.guild.id]['queueEmbed'].fields[2].value = " "
                                    data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + "1 musique")
                                } else {
                                    data[message.guild.id]['queueEmbed'].fields[1].value = musicTitle.slice(indexMin, indexMax).map((value, index) => index + indexMin + '. **' + value).join('**\n') + "**"
                                    data[message.guild.id]['queueEmbed'].fields[2].value = musicDuration.slice(indexMin, indexMax).join('\n')
                                    data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
                                }
                                msg.edit(data[message.guild.id]['queueEmbed'])
                            })

                            forwards.on('collect', r => {
                                if (r.count == 1 || page == nbPages) return
                                console.log(r.users.filter(u => !u.bot))
                                console.log(r.users)
                                    //if (r.users[1]) r.remove(r.users.filter(u => !u.bot))
                                msg.clearReactions().catch(error => console.error('Failed to clear reactions: ', error))
                                msg.react('⬅️').then(res => {
                                    msg.react('➡️')
                                })
                                page++
                                nbPages = Math.ceil(musicTitle.length / 10)
                                indexMin += config.maxQueueDisplay
                                indexMax += config.maxQueueDisplay
                                if (musicTitle[0]) data[message.guild.id]['queueEmbed'].fields[0].value = "🔊 **" + musicTitle[0] + "**"
                                if (musicTitle.length == 1) {
                                    data[message.guild.id]['queueEmbed'].fields[1].value = " "
                                    data[message.guild.id]['queueEmbed'].fields[2].value = " "
                                    data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + "1 musique")
                                } else {
                                    data[message.guild.id]['queueEmbed'].fields[1].value = musicTitle.slice(indexMin, indexMax).map((value, index) => index + indexMin + '. **' + value).join('**\n') + "**"
                                    data[message.guild.id]['queueEmbed'].fields[2].value = musicDuration.slice(indexMin, indexMax).join('\n')
                                    data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
                                }
                                msg.edit(data[message.guild.id]['queueEmbed'])
                            })
                        })
                    }
                })
        }
    }
}