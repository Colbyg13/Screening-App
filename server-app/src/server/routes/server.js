const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.json({ name: 'Test Computer' })
})

module.exports = router
