import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import Express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { refreshJoinCodes } from './data/supabaseController.js'

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'
import RecapRoutes from './routes/recaps.js'
import rulesRoutes from './routes/rules.js'
import CharacterRoutes from './routes/character.js'
import BotRoutes from './routes/bot/bot.js'
import AIRoutes from './routes/ai.js'
import pkg from 'discord.js'
import { handleButton } from './routes/bot/interactions/buttonHandlers.js'
const { Client, GatewayIntentBits, Partials } = pkg

const bot = new Client(
  { intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] })

export default bot

bot.on('clientReady', () => (
  console.log(`Logged in as ${bot.user.tag}!`)
))

bot.on('interactionCreate', async (interaction) => {
  console.log('interactionCreate fired, isButton:', interaction.isButton())
  if (interaction.isButton()) await handleButton(interaction)
})

bot.login(process.env.DISCORD_BOT_TOKEN)

// Configure environment variables
dotenv.config()
const PORT = process.env.PORT || 3000
const USE_DEV_TLS = process.env.USE_DEV_TLS === 'true'

let credentials = null
if (USE_DEV_TLS) {
  const privateKey = fs.readFileSync(path.join('devCert', 'privateDevKey.key'), 'utf8')
  const certificate = fs.readFileSync(path.join('devCert', 'devCert.crt'), 'utf8')
  credentials = { key: privateKey, cert: certificate }
}

const app = new Express()

// Configure body size limits to support large image uploads
app.use(Express.json({ limit: '50mb' }))
app.use(Express.urlencoded({ limit: '50mb', extended: true }))

app.use(morgan('dev'))

// CORS — single middleware, no duplicate app.use(cors())
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://dmdomain.vercel.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Timezone-Offset, X-Requested-With'
  )
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Routes — all lowercase for Linux compatibility
app.use('/Recaps', RecapRoutes)
app.use('/rules', rulesRoutes)
app.use('/user', UserRoutes)
app.use('/data', DataRoutes)
app.use('/character', CharacterRoutes)
app.use('/bot', BotRoutes)
app.use('/ai', AIRoutes)

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Global error handler
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    console.warn('[SERVER] Payload too large for', req.method, req.originalUrl)
    return res.status(413).json({ valid: false, message: 'Payload too large' })
  }
  if (err) console.error('[SERVER] Unhandled error:', err && err.stack ? err.stack : err)
  if (!res.headersSent) {
    return res.status(err && err.status ? err.status : 500).json({ valid: false, message: 'Internal server error' })
  }
  next()
})

if (USE_DEV_TLS && credentials) {
  https.createServer(credentials, app).listen(PORT, () => {
    console.log(`Backend server running with HTTPS on port ${PORT}`)
  })
} else {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

const ONE_DAY = 24 * 60 * 60 * 1000
setInterval(async () => {
  console.log('Refreshing campaign join codes...')
  await refreshJoinCodes()
}, ONE_DAY)