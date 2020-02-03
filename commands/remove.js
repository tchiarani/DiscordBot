module.exports = {
    name: 'remove',
    description: ["Supprime la musique de la file d'attente", "Supprime les musiques de la file d'attente"],
    alias: ['r'],
    usage: ['[chiffre]', '[chiffre] [chiffre]'],
    execute(client, message, args, data) {
        let nbRemoved = 0
        for (let i = 0; i < args.length; i++) {
            if (data[message.guild.id]['dataQueue'][args[i] - nbRemoved] != undefined) {
                message.channel.send('❌ ' + data[message.guild.id]['dataQueue'][args[i] - nbRemoved])
                data[message.guild.id]['queue'].splice(args[i] - nbRemoved, 1)
                data[message.guild.id]['dataQueue'].splice(args[i] - nbRemoved, 1)
                data[message.guild.id]['dataMusicEmbed'].splice(args[i] - nbRemoved, 1)
                data[message.guild.id]['musicTitle'].splice(args[i] - nbRemoved, 1)
                data[message.guild.id]['musicDuration'].splice(args[i] - nbRemoved, 1)
                nbRemoved++
            } else {
                message.channel.send("Pas de numéro **" + args[i] + "** dans la file d'attente.")
            }
        }
    }
}