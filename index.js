const Discord = require('discord.js');
const Attachment = require('discord.js');
const search = require('yt-search');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
const token = 'Mzk4NDg2Mzg2MTExNTQ1MzQ0.XMNP3g.xA3b_XJHw7C4Zx6w2OgIgrHFPjY';
const prefix = '/';
const photoBob = 'https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg';
const photoDr = 'https://cdn.discordapp.com/attachments/372772306553929729/571715565144637446/13_-_Dr_PxxxxCAT_PEEPOODO-01.png';

var radios = {
    'dnb' : ['http://195.201.98.51:8000/dnbradio_main.mp3','drum\'n\'bass'],
    'metal' : ['http://144.217.29.205:80/live','métal'],
    'gold' : ['http://185.33.21.112:80/highvoltage_128','goldé'],
    'core' : ['http://192.95.18.39:5508/song','métalcore'],
    'prog' : ['http://144.76.106.52:7000/progressive.mp3','progressive'],
    'samba' : ['http://148.72.152.10:20028/song','samba'],
    'misc' : ['http://185.85.29.144:8000/','miscellaneous'],
    'hit' : ['http://185.85.29.140:8000/','hit allemand'],
    'dub' : ['http://37.187.124.134:8010/','dub'],
    'black' : ['http://147.135.208.34:8000/song/2/','blackmétal'],
    'chill' : ['http://66.70.187.44:9146/song','chill'],
    'polk' : ['http://70.38.12.44:8144/song','polk'],
    'muhamed' : ['http://108.179.220.88:9302/song','allahu akbar'],
    'motherland' : ['http://air.radiorecord.ru:805/hbass_320','cyka blyat']
/*  'radio' : ['lien', 'texte']  */
};
var musiques = {
    'aspiradance' : ['./Musique/eurodance.mp3','aspiradance']
};
var queue = [];
var dataQueue = [];
var song, music, videos, firstResult;

function play(connection, message) {
    if(!queue[1]){
        song = connection.playStream(ytdl(queue[0], {filter:'audioonly'}));
        song.setVolume(1/50);
        message.channel.send('Vous écoutez **'+firstResult.title+'** ('+firstResult.timestamp+') de **'+firstResult.author.name+'**  dans **'+message.member.voiceChannel.name+'**');
        client.user.setActivity(firstResult.title, { type: 'LISTENING' })
    }else{
        message.channel.send('**'+firstResult.title+'** ('+firstResult.timestamp+') de **'+firstResult.author.name+'**  ajoutée à la file');
    }
    song.on("end", () => {
        queue.shift();
        dataQueue.shift();
        if(!queue[0]) {
            message.channel.send('La file est vide. Deconnexion de **'+message.member.voiceChannel.name+'**');
            client.user.setActivity("Regarde Peepoodo", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
            connection.disconnect();
        }else {
            play(connection, message);
        }
    })
}

client.login(token);

client.on('ready', function() {
    //console.log("--------------------\n--> Bot connecté <--\n--------------------");
    console.log(`-----\nBot connecté, avec ${client.users.size} utilisateurs, dans ${client.channels.size} salons de ${client.guilds.size} serveurs.\n-----`);
    //client.user.setActivity('Peepoodo | /help', { type: 'WATCHING' }).catch(console.error);
    client.user.setActivity("Regarde Peepoodo", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
});

client.on('message', message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    //console.log(message.guild.id);
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

        // JOIN
    if (message.content === prefix + 'join') {
      // Only try to join the sender's voice channel if they are in one themselves
        if (message.member.voiceChannel) {
        message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
            message.channel.send('Connecté dans '+message.member.voiceChannel.name);
            message.react('✅');
        }).catch(console.log);
        } else {
            message.reply('il faut être dans un channel, connard !');
            message.react('🖕');
        }

        // STOP
    }else if (message.content === prefix + 'stop') {
        if(message.member.voiceChannel){
            message.channel.bulkDelete(1).catch(console.error);
            message.member.voiceChannel.leave();
            client.user.setActivity("Regarde Peepoodo", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
            message.channel.send('Déconnexion de '+message.member.voiceChannel.name);
            message.react('🛑');
        }else{
            client.user.setActivity("Regarde Peepoodo", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
            message.channel.send('Je ne suis pas connecté !');
            message.react('🛑');
        }
        
        // PLAY
    }else if (message.content.startsWith(prefix + 'play ')) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
            .then(connection => { // Connection is an instance of VoiceConnection
                var args = message.content.split(' ');
                for(var i=0; i<Object.keys(radios).length; i++) {
                    if(args[1]==Object.keys(radios)[i]) {
                        song = connection.playArbitraryInput(Object.values(radios)[i][0]);
                        song.setVolume(1/50);
                        var words = message.content.split(' ');
                        if(words[2]>=0 && words[2]<=200){
                            song.setVolume(words[2]/5000);
                        }
                        client.user.setActivity('radio '+Object.values(radios)[i][1].toUpperCase(), { type: 'LISTENING' })
                        message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***'+Object.values(radios)[i][1].toUpperCase()+'***  dans **'+message.member.voiceChannel.name+'**');
                        message.react('▶');        
                    }else if(args[1]==Object.keys(musiques)[i]) {
                        song = connection.playFile(Object.values(musiques)[i][0]);
                        song.setVolume(1/50);
                        var words = message.content.split(' ');
                        if(words[2]>=0 && words[2]<=200){
                            song.setVolume(words[2]/5000);
                        }
                        client.user.setActivity(Object.values(musiques)[i][1].toUpperCase(), { type: 'LISTENING' })
                        message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***'+Object.values(musiques)[i][1].toUpperCase()+'***  dans **'+message.member.voiceChannel.name+'**');
                        message.react('▶');  
                    }
                }
            }).catch(console.log);
        }else{
            message.reply('il faut être dans un channel, connard !');
        }

        // RADIO
    }else if (message.content.startsWith(prefix + 'radio ')) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
            .then(connection => { // Connection is an instance of VoiceConnection
                var words = message.content.split(' ');
                client.user.setActivity('la radio', { type: 'LISTENING' })
                song = connection.playArbitraryInput(words[1]);
                song.setVolume(1/50);
                message.react('📻'); 
            }).catch(console.log);
        }

        // VOL
    }else if (message.content.startsWith(prefix + 'vol ')) {
        if (message.member.voiceChannel) {
            var words = message.content.split(' ');
            if(words[1]>=0 && words[1]<=200){
                song.setVolume(words[1]/5000);
                message.react('🔊'); 
            }else{
                message.channel.send('Fais pas l\'fou gamin ! '+words[1]+' c\'est trop fort...');
                message.react('🛑'); 
            }
        }

        // YT
    }else if (message.content.startsWith(prefix + 'yt ')) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
            .then(connection => { // Connection is an instance of VoiceConnection
                let words = message.content.substring(message.content.indexOf(" ") + 1, message.content.length);
                search(words, function (err, r) {
                    message.react('▶'); 
                    if (err) throw err;    
                    videos = r.videos;
                    firstResult = videos[0];
                    dataMusic = '**'+firstResult.title+'** ('+firstResult.timestamp+') de **'+firstResult.author.name+'**';
                    music = 'https://www.youtube.com'+firstResult.url;
                    queue.push(music);
                    dataQueue.push(dataMusic);
                    play(connection, message);
                })
            }).catch(console.log);
        }

        // SKIP
    }else if (message.content === prefix + "skip"){
        message.member.voiceChannel.join()
        .then(connection => {
            message.react('⏭');
            //queue.shift();
            //dataQueue.shift();
            song.end();
        })
        .catch(console.log);

        // HELP
    }else if (message.content === prefix + "help"){
        message.react('📜');
        message.channel.bulkDelete(1).catch(console.error);
        message.channel.send(dataHelp);

        // BOB
    }else if (message.content === prefix + 'bob') {
        const attachment = new Discord.Attachment(photoBob);
        message.channel.send(attachment);

        // PURGE
    }else if (message.content.startsWith(prefix + 'purge ')) {
        var args = message.content.split(' ');
        if(!args[1] || args[1] < 1 || args[1] > 100) return message.reply("Veuillez rentrer un nombre compris entre 1 et 100.");
        message.channel.bulkDelete(args[1]+1).catch(console.error);
        message.react('🗑');

        // PAUSE
    }else if (message.content === prefix + 'pause') {
        if (message.member.voiceChannel) {
            message.react('⏸'); 
            song.pause();
            song.setSpeaking(false);
        }

        // RESUME
    }else if (message.content === prefix + 'resume') {
        if (message.member.voiceChannel) {
            message.react('⏯'); 
            song.resume();
            song.setSpeaking(true);
        }

        // QUEUE
    }else if (message.content === prefix + 'queue') {
        if(dataQueue[0]) message.channel.send(JSON.stringify(dataQueue).replace(/,/g, '\n').replace(/[["]/g, '').replace(/]/g, ''));
    }
  });




  const dataHelp = {
    "embed": {
      "title": "Voici pour vous mon brave :",
      "description": "Préfix : **"+prefix+"**",
      // "url": "https://youtube.com",
      "color": 12214198,
      //"timestamp": "2019-04-27T10:24:30.989Z",
      "footer": {
        "icon_url": photoDr,
        "text": "/help"
      },
      "thumbnail": {
        "url": "https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg"
      },
    //   "image": {
    //     "url": photoBob
    //   },
      "author": {
        "name": "Besoin d'aide ?",
        "url": "",
        "icon_url": photoDr
      },
      "fields": [
        {
            "name": "__**----------------------**__       Commandes",
            "value": "/yt *[mots clés]*\n/yt *[url]*\n/play *[radio] [volume]*\n/play *[radio]*\n/play *[musique]*\n/play *[musique] [volume]*\n/radio *[url]*",
            "inline": true
        },
        {
            "name": "__**----------------------**__",
            "value": "/vol *[0-200]*\n/pause\n/resume\n/purge *[nombre]*\n/join\n/stop\n/bob",
            "inline": true
          },
        {
            "name": "__Liste des radios :__",
            "value": JSON.stringify(Object.keys(radios)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
            "inline": true
        },
        {
            "name": "__Liste des musiques :__",
            "value": JSON.stringify(Object.keys(musiques)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
            "inline": true
        }
      ]
    }
  };