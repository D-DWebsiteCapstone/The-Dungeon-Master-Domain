//This file will be used for the use of connecting to the database and 
// retrieving character information like name, id, image, and backstory.
// Using data.js and user.js as references for how to set up the routes.


import express from 'express'
import { id, name, image, backstory} from '../lib/dataHelper.js'

//complete the character routes here
const router = new express.Router()

router.use(express.json())

router.get('/character/:id', async (req, res) => {
    const characterId = req.params.id
    const character = await getCharacter(characterId)
    if (!character) {
        res.status(404).json({ valid: false, message: 'Character ID not found or something went OOF' })
    } else {
        res.json({ valid: true, character })
    }
})








