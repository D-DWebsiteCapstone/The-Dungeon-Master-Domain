import fs from 'fs'
import path from 'node:path'
import https from 'https'
import Express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

/**
 * Configure and start the express server
 */

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'

// Read in development certificate info
const privateKey = fs.readFileSync(path.join('devCert', 'privateDevKey.key'), 'utf8');
const certificate = fs.readFileSync(path.join('devCert', 'devCert.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Configure cross-origin scripting
const CORS_OPTIONS = {
   origin: ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1'],
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
}

// Configure environment variables
dotenv.config()
const LISTEN_PORT = process.env.LISTEN_PORT ?? 3000

// Creates the express server app
const app = new Express()

// Attach universal app filters
app.use(morgan('dev'))
app.use(cors(CORS_OPTIONS))

// Attach our basic routers
app.use('/user', UserRoutes)
app.use('/data', DataRoutes)

// Setup secure server and listen
const httpsServer = https.createServer(credentials, app)
httpsServer.listen(LISTEN_PORT, () => {
    console.log(`Server listening on https://127.0.0.1:${LISTEN_PORT}`)
})
