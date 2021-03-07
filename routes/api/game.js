const express = require('express');
const router = express.Router();

// Add the code below to index.js to enable the game api in express app
//     app.use('/api/game', require('./routes/api/game'));
// once added, router fucntions below should accessible.  ex. "http:localhost:1235/api/game/create"

router.get('/create', (req, res) => {
    console.log('Creating game...');

    let fullUrl = req.protocol + '://' + req.get('host') + '/gamelobby/83429';
    
    let obj = { gameLobbyUrl: fullUrl };
    res.json(obj);
});


module.exports = router;