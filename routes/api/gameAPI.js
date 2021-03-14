const express = require('express');
const router = express.Router();
const Game = require('../../models/game');

// Add the code below to index.js to enable the game api in express app
//     app.use('/api/game', require('./routes/api/game'));
// once added, router fucntions below should accessible.  ex. "http:localhost:1235/api/game/create"

// API for creating a game this returns the url where the client shoulc be redirected
router.post('/create', (req, res) => {
    console.log('Creating game...');

    const teamName = req.body.teamName;
    let gameID = generateGameID();

    const game = new Game({
        "teamName": teamName,
        "leader": "someLeader",
        "gameID": gameID
    });

    game.save()
        .then((result) => {
            console.log(`Game ${game.teamName} was saved`);
            let fullUrl = req.protocol + '://' + req.get('host') + '/gamelobby/' + gameID;

            res.writeHead(302, {
                "location": fullUrl
            });
            res.end();
        })
        .catch((err) => {
            res.status(500).json({msg:`${err}`});
        });
});


const generateGameID = ()=>{
    let min = 10000;
    let max = 100000;
    return Math.floor(
        Math.random() * (max - min + 1) + min
      )
}

module.exports = router;