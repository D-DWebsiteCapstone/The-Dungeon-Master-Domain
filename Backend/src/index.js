import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

import Express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'

/**
 * Configure and start the express server
 */

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'
import CharacterRoutes from './routes/character.js'

// Configure environment variables
dotenv.config()
const LISTEN_PORT = process.env.LISTEN_PORT ?? 3000

// Creates the express server app
const app = new Express()


// Attach universal app filters
app.use(morgan('dev'))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
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

// Allow forcing plain HTTP for development even if certs are present
const FORCE_HTTP = process.env.FORCE_HTTP === '1'
if (FORCE_HTTP) {
  console.warn('FORCE_HTTP=1 set — starting plain HTTP server for development')
  app.listen(LISTEN_PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
  })
} else {
  // Try to start HTTPS server if dev certs are present, otherwise fall back to plain HTTP
  try {
    const privateKey = fs.readFileSync(path.join('devCert', 'privateDevKey.key'), 'utf8')
    const certificate = fs.readFileSync(path.join('devCert', 'devCert.crt'), 'utf8')
    const credentials = { key: privateKey, cert: certificate }
    const httpsServer = https.createServer(credentials, app)
    httpsServer.listen(LISTEN_PORT, () => {
      console.log(`Server listening on https://127.0.0.1:${LISTEN_PORT}`)
    })
  } catch (err) {
    console.warn('HTTPS certificates not available — falling back to HTTP. Error:', err?.message ?? err)
    app.listen(LISTEN_PORT, () => {
      console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
    })
  }
}