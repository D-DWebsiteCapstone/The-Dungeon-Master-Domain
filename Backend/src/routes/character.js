//This file will be used for the use of connecting to the database and 
// retrieving character information like name, id, image, and backstory.
// Using data.js and user.js as references for how to set up the routes.


import express from 'express'
import {
    getAllCharacters,
    getCharacterById,
    getCharacterByName,
    getCharacterByImage,
    getCharacterByBackstory,
    createCharacter,
    updateCharacter,
    deleteCharacter
} from '../data/supabaseController.js'

//complete the character routes here
const router = new express.Router()

router.use(express.json())

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

// Route to get character by ID
router.get('/character/:id', async (req, res) => {
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
router.get('/character/name/:name', async (req, res) => {
    const characterName = req.params.name
    const character = await getCharacterByName(characterName)   
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character name not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }  
})

// Route to get character by Image
router.get('/character/image/:image', async (req, res) => {
    const characterImage = req.params.image
    const character = await getCharacterByImage(characterImage)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character image not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }
})

// Route to get character by Backstory
router.get('/character/backstory/:backstory', async (req, res) => {
    const characterBackstory = req.params.backstory
    const character = await getCharacterByBackstory(characterBackstory)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character backstory not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }
})

//This part will be for posting new characters to the database

router.post('/character', async (req, res) => {
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
        id: '414c399f-1f2d-4153-9fa6-df00d4373ee8',
        name: 'Chris Chan',
        image: '\x68747470733a2f2f69312e736e6463646e2e636f6d2f617274776f726b732d4d37505a4f5167466a304e6a67664a782d363854617a772d74323430783234302e6a7067',
        backstory: 'We don\'t talk about the evils she has commited.'
    }
    sample.image = decodeHexIfNeeded(sample.image)
    res.json({ valid: true, character: sample })
})

//export the router
export default router