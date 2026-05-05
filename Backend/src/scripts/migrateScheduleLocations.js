import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const DBClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_PUB_KEY)

async function migrateScheduleLocations() {
  console.log('No database migration is required for schedule locations.')
  console.log('Future session locations are stored in the existing campaign SessionLocation field.')
}

migrateScheduleLocations().catch(err => {
  console.error(err)
  process.exit(1)
})