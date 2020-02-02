module.exports = {
    name: 'stop',
    description: ['Déconnecte le bot du salon vocal et vide la file'],
    usage: [''],
    alias: ['s'],
    execute(message) {
        if (message.member.voiceChannel === message.guild.me.voiceChannel) {
            message.member.voiceChannel.leave()
            message.react('🛑')
        } else {
            message.channel.send('Je ne suis pas connecté dans un salon avec vous !')
            message.react('❌')
        }
    }
}