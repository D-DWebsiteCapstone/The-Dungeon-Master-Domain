import express from 'express';
import bot from '../../index.js'
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';

const router = new express.Router();

function authenticate(req,res,next){
const token = req.headers['authorization']?.replace('Bearer ', '');
console.log(token);
if (!token) return res.status(401).json({ message: 'No token provided' });
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    console.log('JWT error:', err.message)
    return res.status(403).json({ message: 'Invalid token' })
  }

}

// Get mutual servers between user and bot
router.get('/guilds', authenticate, async (req, res) => {
  try {
    // Fetch the user's guilds using their stored Discord access token
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${req.user.discordAccessToken}` }
    })
    const userGuilds = await response.json()
    console.log('req.user:', JSON.stringify(req.user, null, 2))
    console.log('Discord response:', JSON.stringify(userGuilds, null, 2))

    // Filter to only servers the bot is also in
    const botGuildIds = bot.guilds.cache.map(g => g.id)
    const mutualGuilds = userGuilds.filter(g => botGuildIds.includes(g.id))

    res.json({ guilds: mutualGuilds })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: 'Failed to fetch guilds' })
  }
})

// Get channels for a specific server
router.get('/guilds/:guildId/channels', authenticate, async (req, res) => {
  try {
    const guild = await bot.guilds.fetch(req.params.guildId)
    const channels = await guild.channels.fetch()
    const textChannels = channels
      .filter(c => c.type === 0) // text channels only
      .map(c => ({ id: c.id, name: c.name }))

    res.json({ channels: textChannels })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch channels' })
  }
})

// Send the invite message to the selected channel
router.post('/send-campaign-invite', authenticate, async (req, res) => {
  const { channelId, campaignId, campaignName } = req.body

  try {
    const channel = await bot.channels.fetch(channelId)

    const embed = new EmbedBuilder()
      .setTitle(`Campaign Invite: ${campaignName}`)
      .setDescription('You have been invited to join this campaign!')
      .setColor(0x5865F2)

    const button = new ButtonBuilder()
      .setCustomId(`join_campaign:${campaignId}`)
      .setLabel('Join Campaign')
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder().addComponents(button)

    await channel.send({ embeds: [embed], components: [row] })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send invite' })
  }
})

export default router;