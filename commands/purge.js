module.exports = {
    name: 'purge',
    description: ["Supprime les derniers messages"],
    alias: [],
    usage: ['[chiffre]'],
    execute(client, message, args, data) {
        if (args[0] == undefined || args[0] < 1 || args[0] > 100) {
            message.reply('La valeur doit être comprise entre 0 et 100.')
        } else {
            message.delete()
            message.channel.bulkDelete(args[1], true).catch(console.error)
        }
    }
}