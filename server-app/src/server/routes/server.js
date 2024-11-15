const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ type: 'healthy_samoa_server_app' });
});

module.exports = router;
