const express = require('express');
const router = express.Router();
const gameEnv = require('../controller/gameEnvironment');

// router.get('/redirect/:sessId', (req, res) => {
//     let sessId = req.params.sessId;
//     let gameId = gameEnv.clientToGameMapping[sessId];
//     let fullUrl = req.protocol + '://' + req.get('host') + '/gamelobby/' + gameId;

//     if (!gameId) {
//         // redirect to home
//         fullUrl = req.protocol + '://' + req.get('host') + '/';
//         res.writeHead(302, {
//             "location": fullUrl
//         });
//         res.end();
//         return;
//     } else {
//         // redirect to lobby
//         fullUrl = req.protocol + '://' + req.get('host') + '/gamelobby/' + gameId;
//         res.writeHead(302, {
//             "location": fullUrl
//         });
//         res.end();
//     }
// });

// redirect user to 'views/home.handlebars' page
router.get('/', (req, res) => {
    // populate the object in 2nd parameter to pass value in homepage
    res.render('home', {});
});

// redirect to gamelobby page
router.get('/gamelobby/:id', (req, res) => {
    const gameid = req.params.id;
    let game = gameEnv.allGames[gameid];

    if (game) {
        // populate the object in 2nd parameter to pass value in gambelobby page
        res.render('gameLobby', {
            "gameid": gameid,
            "teamName": game.teamName
        });
    } else {
        let fullUrl = req.protocol + '://' + req.get('host') + '/';
        res.writeHead(302, {
            "location": fullUrl
        });
        res.end();
    }
});

module.exports = router;