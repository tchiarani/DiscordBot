const Discord = require('discord.js')
const fs = require('fs')
const config = require('./config')
const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const commandName = require(`./commands/${file}`);
    client.commands.set(commandName.name, commandName);
}

let data = []

function initGuild(id) {
    data[id] = []
    data[id]['song'] = []
    data[id]['firstResult'] = {}
    data[id]['queue'] = []
    data[id]['dataQueue'] = []
    data[id]['dataMusicEmbed'] = []
    data[id]['specificHelpEmbed'] = {}

    data[id]['queueEmbed'] = {}
    data[id]['musicTitle'] = []
    data[id]['musicDuration'] = []
}

client.login(config.token)

client.on('guildCreate', (guild) => {
    initGuild(guild.id)
})

function setMyActivity() {
    client.user.setActivity("unikorn.ga | /help", { type: "WATCHING" })
}

client.on('ready', function() {
    console.log(`-----\nBot connecté dans ${client.guilds.size} serveurs différents, pour ${client.users.size} utilisateurs.\n-----`)
    client.user.setActivity("UniiKorn 🦄", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
    config.botAvatar = client.user.avatarURL
})

client.on('message', async message => {

    const args = message.content.slice(config.prefix.length).split(' ')
    let commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))
    if (command) commandName = await command.name

    if (!message.guild || message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return
    if (!command) return
    if (!message.member) message.member = await message.guild.fetchMember(message)

    message.content = message.content.toLowerCase()

    try {
        command.execute(message, args, data)
    } catch (error) {
        console.error("Error" + error)
    }

    // // STOP
    // if (commandName === 'stop') {
    //     client.commands.get('stop').execute(message)

    //     // PLAY
    // } else if (commandName === 'play') {
    //     client.commands.get('play').execute(message, args, data)

    //     // RADIO
    // } else if (commandName === 'radio') {
    //     client.commands.get('radio').execute(message, data)

    //     // VOLUME
    // } else if (commandName === 'volume') {
    //     client.commands.get('volume').execute(message, args, data)

    //     // SKIP
    // } else if (commandName === "skip") {
    //     client.commands.get('skip').execute(message, data)

    //     // RADIOS
    // } else if (commandName === "radios") {
    //     client.commands.get('radios').execute(message)

    //     // MUSIQUES
    // } else if (commandName === "musiques") {
    //     client.commands.get('musiques').execute(message)

    //     // PURGE
    // } else if (commandName === 'purge') {
    //     client.commands.get('purge').execute(message, args)

    //     // PAUSE
    // } else if (commandName === 'pause') {
    //     client.commands.get('pause').execute(message, args, data)

    //     // RESUME
    // } else if (commandName === 'resume') {
    //     client.commands.get('resume').execute(message, args, data)

    //     // QUEUE
    // } else if (commandName === 'queue') {
    //     client.commands.get('queue').execute(message, args, data)

    //     // REMOVE
    // } else if (commandName === 'remove') {
    //     client.commands.get('remove').execute(message, args, data)

    //     // POLL
    // } else if (commandName === 'poll') {
    //     client.commands.get('poll').execute(message)

    //     // AVATAR
    // } else if (commandName === 'avatar') {
    //     client.commands.get('avatar').execute(message)

    //     // UPTIME 
    // } else if (commandName === 'uptime') {
    //     client.commands.get('uptime').execute(client, message, args)

    //     // HELP
    // } else if (commandName === 'help') {
    //     client.commands.get('help').execute(message, args, data)
    // }

})