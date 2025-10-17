import dotenv from 'dotenv'
import Express from 'express'
import morgan from 'morgan'

/**
 * Configure and start the express server
 */

// Import the individual routers
import UserRoutes from './routes/users.js'
import DataRoutes from './routes/data.js'

// Configure environment variables
dotenv.config()
const LISTEN_PORT = process.env.LISTEN_PORT ?? 3000

// Creates the express server app
const app = new Express()

// Attach universal app filters
app.use(morgan('dev'))

// Attach our basic routers
app.use('/user', UserRoutes)
app.use('/data', DataRoutes)

// Listen
app.listen(LISTEN_PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
})
