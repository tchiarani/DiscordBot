# **DiscordBot**

Discord bot that delivers music to your server.

## Install

Requires [node.js](https://nodejs.org) and [npm](https://www.npmjs.com/) to run.

Install the dependencies and start the application.

```
npm install
node index
```

> Don't forget to **change the token** of your [Discord application](https://discord.com/developers/applications) provided in config.js.

## Usage

**You want to add my bot to your server ?**

[![Invite to your server](https://imgur.com/ebFKyEe.png)](https://discord.com/oauth2/authorize?client_id=398486386111545344&scope=bot&permissions=2147482871)

## Documentation

**Commands list :**

|Command         |Alias                          |Description                          |
|----------------|-------------------------------|-------------------------------------|
|`/avatar`       |`/icon`                        |Display server member avatar         |
|`/help`         |`/h`                           |Display commands help                |
|`/pause`        |                               |Pause the current song               |
|`/play`         |`/p`                           |Play the song passed in argument     |
|`/poll`         |                               |Display server member avatar         |
|`/purge`        |                               |Purge latest messages                |
|`/queue`        |`/q`                           |Display server current queue         |
|`/radio`        |                               |Play the radio passed in argument    |
|`/remove`       |`/r`                           |Remove a song from the queue         |
|`/resume`       |                               |Resume the current song              |
|`/skip`         |                               |Skip the current song                |
|`/stop`         |`/s`                           |Stop the current song and disconnect |
|`/uptime`       |                               |Display bot uptime                   |
|`/volume`       |`/v`, `/vol`                   |Change volume from 0 to 200          |

## Roadmap

- [x] Fix purge command
- [ ] Add image manipulation with canvas
- [ ] Add music streaming platforms to the library

## Project status

Development has stopped.
