import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badkey'

const DBClient = createClient(SUPABASE_URL, SUPABASE_PUB_KEY)

// Maximum number of results allowed to return
const MIN_RESULTS = 1
const MAX_RESULTS = 100

export async function listCampaigns(offset, perPage) {
    // Clamp per-page value to something reasonable
    const clampedPerPage = Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, perPage))

    // Do query for campaign with matching ID
    const { data, error } = await DBClient
        .from('Campaign').select('id, title')
        .range(offset, offset + (clampedPerPage - 1))

    // Throw errors back to the route
    if (error) {
        console.error(error)
        throw error
    }

    // Return data
    return data
}

export async function getCampaign(campaignId) {
    // Do query for campaign with matching ID
    const { data, error } = await DBClient
        .from('Campaign').select().eq('id', campaignId)

    // Throw errors back to the route
    if (error) {
        console.error(error)
        throw error
    }

    // Return data
    return data[0]
}

export async function insertCampaign({ title, id, userId, roleName, selectedCharacter = null }) {
    return await DBClient
        .from('Campaign') // your table name
        .insert([{
            campaigntitle: title,
            campaignid: id,
            userid: userId,
            rolename: roleName,
            selectedcharacter: selectedCharacter
        }])
        .select()
}