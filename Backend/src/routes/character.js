//This file will be used for the use of connecting to the database and 
// retrieving character information like name, id, image, and backstory.
// Using data.js and user.js as references for how to set up the routes.


import express from 'express'
import {
    getCharacterById, createCharacter, getCharacterByName,
} from '../data/supabaseController.js'

//complete the character routes here
const router = new express.Router()

router.use(express.json())

// Simple request logger for these routes
router.use((req, res, next) => {
    console.log(`[CHAR ROUTES] ${req.method} ${req.originalUrl}`)
    next()
})

// Helper to wrap async route handlers and log errors
function wrapAsync(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(err => {
            console.error('[CHAR ROUTES] Unhandled error for', req.method, req.originalUrl, ':', err && err.stack ? err.stack : err)
            try {
                if (!res.headersSent) res.status(500).json({ valid: false, message: 'Internal server error' })
            } catch (e) {
                console.error('[CHAR ROUTES] Failed to send error response:', e)
            }
        })
    }
}

// Helper: decode Postgres bytea hex strings like "\\x687474..." into UTF-8
function decodeHexIfNeeded(val) {
    if (typeof val !== 'string') return val
    // Match strings that start with "\x" followed by hex, e.g. "\x68656c6c6f"
    const m = val.match(/^\\x([0-9a-fA-F]+)$/)
    if (m && m[1]) {
        try {
            return Buffer.from(m[1], 'hex').toString('utf8')
        } catch (e) {
            console.warn('Failed to decode hex image string:', e?.message ?? e)
            return val
        }
    }
    // If it's plain hex (no prefix) and even length, try decoding
    if (/^[0-9a-fA-F]+$/.test(val) && val.length % 2 === 0) {
        try {
            const decoded = Buffer.from(val, 'hex').toString('utf8')
            // only return decoded if it looks like a URL (starts with http)
            if (/^https?:\/\//i.test(decoded)) return decoded
        } catch (e) { /* ignore */ }
    }
    return val
}

// Route to get character by a generic ID (useful if you want an explicit by-id path)
// Mounted at /character -> /character/by-id/:id
router.get('/by-id/:id', async (req, res) => {
    const characterId = req.params.id
    const character = await getCharacterById(characterId)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character ID not found or something went OOF' })
    } else {
        // decode image field if it was stored as Postgres bytea hex
        if (character && character.image) character.image = decodeHexIfNeeded(character.image)
        res.json({ valid: true, character })
    }
})

// Route to get character by Name
// keep the "by-" prefix to match tests (mounted: /character/by-name/:name)
router.get('/by-name/:name', async (req, res) => {
    const characterName = req.params.name
    const character = await getCharacterByName(characterName)   
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character name not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }  
})

// Route to get character by Image
// mounted: /character/by-image/:image
router.get('/by-image/:image', async (req, res) => {
    const characterImage = req.params.image
    const character = await getCharacterByImage(characterImage)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character image not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }
})

// Route to get character by Backstory
// mounted: /character/by-backstory/:backstory
router.get('/by-backstory/:backstory', async (req, res) => {
    const characterBackstory = req.params.backstory
    const character = await getCharacterByBackstory(characterBackstory)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character backstory not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }
})

//This part will be for posting new characters to the database

router.post('/', async (req, res) => {
    const { id, name, image, backstory } = req.body
    const newCharacter = await createCharacter({ id, name, image, backstory })
    if (!newCharacter) {
        res.status(400).json({ valid: false, message: 'Failed to create character you dingus' })
    } else {
        res.status(201).json({ valid: true, character: newCharacter })
    }
})

// Simple test endpoint that returns a known sample character for frontend development
router.get('/test', async (req, res) => {
    const sample = {
        id: '0',
        name: 'Smooth guy',
        image: 'https://i.pinimg.com/236x/3f/e3/49/3fe349c572b2f34515e4f7bab1348ec4.jpg',
        backstory: 'He do be walking smooth'
    }
    sample.image = decodeHexIfNeeded(sample.image)
    res.json({ valid: true, character: sample })
})

// Debug endpoint: always-available sample character for network tests
router.get('/debug', (req, res) => {
    const sample = {
        id: 'debug-1',
        name: 'Debug Character',
        image: decodeHexIfNeeded('\x68747470733a2f2f69312e736e6463646e2e636f6d2f617274776f726b732d4d37505a4f5167466a304e6a67664a782d363854617a772d74323430783234302e6a7067'),
        backstory: 'This is a debug-only sample character returned by /characters/debug'
    }
    res.json({ valid: true, character: sample })
})

// Return a page of characters (dev helper) - decodes image fields
router.get('/all', wrapAsync(async (req, res) => {
    const list = await getAllCharacters(0, 50)
    const normalized = (list || []).map(c => ({
        ...c,
        image: c && c.image ? decodeHexIfNeeded(c.image) : c && c.image
    }))
    console.log('[CHAR ROUTES] returning', normalized.length, 'characters')
    res.json({ valid: true, count: normalized.length, characters: normalized })
}))

// Explicit lookup by uuid column
router.get('/by-uuid/:id', wrapAsync(async (req, res) => {
    const characterId = req.params.id
    console.log('[CHAR ROUTES] by-uuid lookup for', characterId)
    // Try direct uuid query via controller helper attempt (tryFromTables covers multiple table names)
    const character = await getCharacterById(characterId)
    if (!character) return res.status(404).json({ valid: false, message: 'Not found' })
    if (character && character.image) character.image = decodeHexIfNeeded(character.image)
    res.json({ valid: true, character })
}))

//export the router
export default router