//This file will be used for the use of connecting to the database and 
// retrieving character information like name, id, image, and backstory.
// Using data.js and user.js as references for how to set up the routes.


import express from 'express'
import { id, name, image, backstory} from '../lib/dataHelper.js'

//complete the character routes here
const router = new express.Router()

router.use(express.json())

// Route to get character by ID
router.get('/character/:id', async (req, res) => {
    const characterId = req.params.id
    const character = await getCharacter(characterId)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character ID not found or something went OOF' })
    } else {
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

//export the router
export default router