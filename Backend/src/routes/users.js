import Express from 'express'

const router = new Express.Router()

router.get('/login', (req, res) => {
    // Validate the user
    res.json({ valid: false })
})

export default router
