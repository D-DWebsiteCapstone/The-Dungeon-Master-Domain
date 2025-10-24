import dotenv from 'dotenv'
import Express from 'express'
import morgan from 'morgan'

/**
 * Configure and start the express server
 */

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'
import { refreshJoinCodes } from './data/supabaseController.js'

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

// Listen
app.listen(LISTEN_PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
})

const ONE_DAY = 24 * 60 * 60 * 1000
setInterval(async () => {
  console.log('Refreshing campaign join codes...')
  await refreshJoinCodes()
}, ONE_DAY)
