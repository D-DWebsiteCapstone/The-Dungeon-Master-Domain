import express from 'express';
import bot from '../../index.js';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getUserById, DBClient } from "../../data/supabaseController.js";

const router = new express.Router();

function authenticate(req,res,next){
const token = req.headers['authorization']?.replace('Bearer ', '');
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
    const user = await getUserById(req.user.id)

    if (!user?.discord_access_token) {
      return res.status(400).json({ message: 'No Discord account linked.' })
    }

    const accessToken = await getValidDiscordToken(user) // use this instead

    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const userGuilds = await response.json()

console.log('Discord status:', response.status)
//console.log('Discord guilds response:', JSON.stringify(userGuilds, null, 2))

    if (!Array.isArray(userGuilds)) {
      return res.status(400).json({ message: 'Failed to fetch Discord servers. Try reconnecting your Discord account.' })
    }

    const botGuildIds = bot.guilds.cache.map(g => g.id)
    const mutualGuilds = userGuilds.filter(g => botGuildIds.includes(g.id))

    res.json({ guilds: mutualGuilds })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message })
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

async function getValidDiscordToken(user) {
  console.log('Token expiry:', user.discord_token_expiry)
  console.log('Current time:', Date.now())
  console.log('Token expired?', Date.now() >= user.discord_token_expiry - 300000)
  console.log('Refresh token:', user.discord_refresh_token)

  if (Date.now() < user.discord_token_expiry - 300000) {
    console.log('Token still valid, using existing')
    return user.discord_access_token
  }

  console.log('Refreshing token...')
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.discord_refresh_token
    })
  })

  const data = await response.json()
  console.log('Refresh response:', JSON.stringify(data, null, 2))

  if (!data.access_token) {
    throw new Error('Failed to refresh Discord token. User must re-link their Discord account.')
  }

  await DBClient
    .from('Users')
    .update({
      discord_access_token: data.access_token,
      discord_refresh_token: data.refresh_token,
      discord_token_expiry: Date.now() + data.expires_in * 1000
    })
    .eq('userid', user.userid)

  return data.access_token
}

export default router;