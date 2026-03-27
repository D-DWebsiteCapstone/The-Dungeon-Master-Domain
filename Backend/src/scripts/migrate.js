import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PDFDocument } from "pdf-lib";

// Read in environment variables
dotenv.config()
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY


export const DBClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_PUB_KEY)

// Maximum number of results allowed to return
const MIN_RESULTS = 1

async function migrate() {
  const { error } = await DBClient.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS npcs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        campaign UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        "createdBy" TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_npcs_campaign ON npcs(campaign);
    `
  })

  if (error) {
    console.error('Migration failed:', error)
  } else {
    console.log('npcs table ready')
  }
}

migrate()