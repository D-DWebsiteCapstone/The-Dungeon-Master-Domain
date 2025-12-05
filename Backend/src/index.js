import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

import Express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { refreshJoinCodes } from './data/supabaseController.js'

/**
 * Configure and start the express server
 */

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'
import CharacterRoutes from './routes/character.js'

// Configure environment variables
dotenv.config()
const PORT = process.env.PORT || 3000
const USE_DEV_TLS = process.env.USE_DEV_TLS === 'true'

// Read in development certificate info only when explicitly enabled
let credentials = null
if (USE_DEV_TLS) {
  const privateKey = fs.readFileSync(path.join('devCert', 'privateDevKey.key'), 'utf8')
  const certificate = fs.readFileSync(path.join('devCert', 'devCert.crt'), 'utf8')
  credentials = { key: privateKey, cert: certificate }
}

// Creates the express server app
const app = new Express()


// Attach universal app filters
app.use(morgan('dev'))

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://monkfish-app-we7vr.ondigitalocean.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Attach our basic routers
app.use('/user', UserRoutes)
app.use('/data', DataRoutes)
app.use('/character', CharacterRoutes)

// Lightweight health check for platform monitors
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Global error handler: return JSON for payload-too-large and other errors
app.use((err, req, res, next) => {
  // body-parser / raw-body sets `err.type === 'entity.too.large'` for oversized bodies
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    console.warn('[SERVER] Payload too large for', req.method, req.originalUrl)
    return res.status(413).json({ valid: false, message: 'Payload too large' })
  }

  // For all other errors, log and return JSON internal-server-error
  if (err) console.error('[SERVER] Unhandled error:', err && err.stack ? err.stack : err)
  if (!res.headersSent) {
    return res.status(err && err.status ? err.status : 500).json({ valid: false, message: 'Internal server error' })
  }
  next()
})
/*
// Setup secure server and listen
const httpsServer = https.createServer(credentials, app)
httpsServer.listen(LISTEN_PORT, () => {
    console.log(`Server listening on https://127.0.0.1:${LISTEN_PORT}`)
})
*/
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
