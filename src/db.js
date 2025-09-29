import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
console.log('Connecting to database:', connectionString);
const sql = postgres(connectionString) 


export default sql
