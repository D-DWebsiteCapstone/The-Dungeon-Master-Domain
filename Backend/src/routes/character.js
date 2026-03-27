//This file will be used for the use of connecting to the database and 
// retrieving character information like name, id, image, and backstory.
// Using data.js and user.js as references for how to set up the routes.

const MAX_CHARACTERS_PER_USER = 10 // this to limit how many characters a single user can create, to prevent abuse. Enforced in the createCharacter controller helper. Adjust as needed.

import express from 'express'
import {
    getCharacterById, createCharacter, getCharacterByName,
    getCharacterByImage, getCharacterByBackstory, getAllCharacters, editCharacter,
    getCharactersByCreator, deleteCharacterById, countCharactersByCreator, checkAdminPerm
} from '../data/supabaseController.js'

//complete the character routes here
const router = new express.Router()

// Accept reasonably-sized JSON bodies for character creation/edit (data-URL images).
// The frontend limits uploads to ~2 MB; match that here so oversized requests are
// rejected with a controlled error (handled by global error middleware).
router.use(express.json({ limit: '2mb' }))

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
                if (!res.headersSent) {
                    const message = err?.message || 'Internal server error'
                    const status = Number.isInteger(err?.status) ? err.status : 500
                    res.status(status).json({ valid: false, message })
                }
            } catch (e) {
                console.error('[CHAR ROUTES] Failed to send error response:', e)
            }
        })
    }
}

// Helper: decode Postgres bytea hex strings like "\\x687474..." into UTF-8
function decodeHexIfNeeded(val) {
    if (typeof val !== 'string') return val
    try {
        const m = val.match(/^\\x([0-9a-fA-F]+)$/)
        if (m && m[1]) {
            return Buffer.from(m[1], 'hex').toString('utf8')
        }
        if (/^[0-9a-fA-F]+$/.test(val) && val.length % 2 === 0) {
            const decoded = Buffer.from(val, 'hex').toString('utf8')
            if (/^https?:\/\//i.test(decoded)) return decoded
        }
    } catch (e) {
        console.warn('[decodeHexIfNeeded] Failed to decode value:', e?.message ?? e)
    }
    return val
}

// Add this helper at the top of character.js
function normalizeCharacter(c) {
    if (!c) return c
    return {
        ...c,
        level: c.level ?? c.Level ?? 1,
        class: c.class ?? c.class_ ?? '',
        // Always expose as "image" to the frontend regardless of which column it came from
        image: c.image_url || (c.image ? decodeHexIfNeeded(c.image) : null)
    }
}

function normalizeCharacterForClient(c) {
    return normalizeCharacter(c)
}

// Route to get character by a generic ID (useful if you want an explicit by-id path)
// Mounted at /character -> /character/by-id/:id
router.get('/by-id/:id', wrapAsync(async (req, res) => {
    const characterId = req.params.id
    const character = await getCharacterById(characterId)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character ID not found or something went OOF' })
    } else {
        res.json({ valid: true, character: normalizeCharacterForClient(character) })
    }
}))

// Route to get character by Name
// keep the "by-" prefix to match tests (mounted: /character/by-name/:name)
router.get('/by-name/:name', wrapAsync(async (req, res) => {
    const characterName = req.params.name
    const character = await getCharacterByName(characterName)   
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character name not found or something went OOF' })
    } else {
        res.json({ valid: true, character: normalizeCharacterForClient(character) })
    }  
}))

// Route to get character by Image
// mounted: /character/by-image/:image
router.get('/by-image/:image', wrapAsync(async (req, res) => {
    const characterImage = req.params.image
    const character = await getCharacterByImage(characterImage)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character image not found or something went OOF' })
    } else {
        res.json({ valid: true, character: normalizeCharacterForClient(character) })
    }
}))

// Route to get character by Backstory
// mounted: /character/by-backstory/:backstory
router.get('/by-backstory/:backstory', wrapAsync(async (req, res) => {
    const characterBackstory = req.params.backstory
    const character = await getCharacterByBackstory(characterBackstory)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character backstory not found or something went OOF' })
    } else {
        res.json({ valid: true, character: normalizeCharacterForClient(character) })
    }
}))

//This part will be for posting new characters to the database

router.post('/', wrapAsync(async (req, res) => {
    // Accept createdBy from client so we can store who made the character
    const {
        id,
        name,
        image,
        backstory,
        createdBy,
        class_: className,
        level,
        subClass,
        background,
        race,
        alignment,
        maxHealth,
        armorClass,
        str,
        dex,
        con,
        int,
        wis,
        cha
    } = req.body

    if (!createdBy) {
        return res.status(400).json({ valid: false, message: 'createdBy is required' })
    }

    const existingCount = await countCharactersByCreator(createdBy)
    if (existingCount >= MAX_CHARACTERS_PER_USER) {
        return res.status(409).json({
            valid: false,
            code: 'CHARACTER_LIMIT_REACHED',
            limit: MAX_CHARACTERS_PER_USER,
            message: `Character limit reached (${MAX_CHARACTERS_PER_USER}). Delete one before creating another.`
        })
    }

    const newCharacter = await createCharacter({
        id,
        name,
        image,
        backstory,
        createdBy,
        class_: className,
        level,
        subClass,
        background,
        race,
        alignment,
        maxHealth,
        armorClass,
        str,
        dex,
        con,
        int,
        wis,
        cha
    })
    if (!newCharacter) {
        res.status(400).json({ valid: false, message: 'Failed to create character you dingus' })
    } else {
        res.status(201).json({ valid: true, character: normalizeCharacterForClient(newCharacter) })
    }
}))

// Simple test endpoint that returns a known sample character for frontend development
router.get('/test', async (req, res) => {
    const sample = {
        id: '0',
        name: 'Smooth guy',
        image: 'https://i.pinimg.com/236x/3f/e3/49/3fe349c572b2f34515e4f7bab1348ec4.jpg',
        backstory: 'He do be walking smooth'
    }
    res.json({ valid: true, character: normalizeCharacterForClient(sample) })
})

// Debug endpoint: always-available sample character for network tests
router.get('/debug', (req, res) => {
    const sample = {
        id: 'debug-1',
        name: 'Debug Character',
        image: decodeHexIfNeeded('\x68747470733a2f2f69312e736e6463646e2e636f6d2f617274776f726b732d4d37505a4f5167466a304e6a67664a782d363854617a772d74323430783234302e6a7067'),
        backstory: 'This is a debug-only sample character returned by /characters/debug'
    }
    res.json({ valid: true, character: normalizeCharacterForClient(sample) })
})

// Return a page of characters (dev helper) - decodes image fields
router.get('/all', wrapAsync(async (req, res) => {
    const list = await getAllCharacters(0, 50)
    const normalized = (list || [])
    .filter(c => c != null && typeof c === 'object')
    .map(c => normalizeCharacter(c))
    console.log('[CHAR ROUTES] returning', normalized.length, 'characters')
    res.json({ valid: true, count: normalized.length, characters: normalized })
}))

// Return all characters created by a given username (createdBy column)
router.get('/by-creator/:username', wrapAsync(async (req, res) => {
    const username = req.params.username
    console.log('[CHAR ROUTES] by-creator lookup for', username)
    const list = await getCharactersByCreator(username)
    const normalized = (list || [])
    .filter(c => c != null && typeof c === 'object')
    .map(c => normalizeCharacter(c))
    res.json({ valid: true, count: normalized.length, limit: MAX_CHARACTERS_PER_USER, characters: normalized })
}))

// Explicit lookup by uuid column
router.get('/by-uuid/:id', wrapAsync(async (req, res) => {
    const characterId = req.params.id
    console.log('[CHAR ROUTES] by-uuid lookup for', characterId)
    // Try direct uuid query via controller helper attempt (tryFromTables covers multiple table names)
    const character = await getCharacterById(characterId)
    if (!character) return res.status(404).json({ valid: false, message: 'Not found' })
    res.json({ valid: true, character: normalizeCharacterForClient(character) })
}))


//Route to delete character
router.delete('/:id', wrapAsync(async (req, res) => {
    const characterId = req.params.id
    const deleted = await deleteCharacterById(characterId)
    if (!deleted) {
        return res.status(404).json({ valid: false, message: 'Character not found' })
    }
    res.json({ valid: true, character: normalizeCharacterForClient(deleted) })
}))
//Route to edit character info
router.put('/:id', wrapAsync(async (req, res) => {
    const characterId = req.params.id
    const {
        name,
        image,
        backstory,
        class_: className,
        level,
        subClass,
        background,
        race,
        alignment,
        maxHealth,
        armorClass,
        str,
        dex,
        con,
        int,
        wis,
        cha
    } = req.body
    const character = await editCharacter({
        id: characterId,
        name,
        image,
        backstory,
        class_: className,
        level,
        subClass,
        background,
        race,
        alignment,
        maxHealth,
        armorClass,
        str,
        dex,
        con,
        int,
        wis,
        cha
    })
    if (!character) {
        res.status(400).json({ valid: false, message: 'Failed to update character' })
    } else {
        res.json({ valid: true, character: normalizeCharacterForClient(character) })
    }
}))



//export the router
export default router