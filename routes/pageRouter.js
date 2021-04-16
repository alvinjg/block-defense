const express = require('express');
const router = express.Router();
const gameEnv = require('../controller/gameEnvironment');

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
        let fullUrl = req.protocol + '://' + req.get('host');
        // populate the object in 2nd parameter to pass value in gambelobby page
        res.render('gameLobby', {
            "gameid": gameid,
            "teamName": game.teamName,
            "leaderId": game.leader,
            "host": fullUrl
        });
    } else {
        let fullUrl = req.protocol + '://' + req.get('host') + '/';
        res.writeHead(302, {
            "location": fullUrl
        });
        res.end();
    }
});

router.get('/gamepage/:id', (req, res) => {
    const gameid = req.params.id;
    let game = gameEnv.allGames[gameid];

    if (game) {
        // populate the object in 2nd parameter to pass value in gambelobby page
        res.render('gamePage', {
            "gameObj": game
        });
    } else {
        let fullUrl = req.protocol + '://' + req.get('host') + '/';
        res.writeHead(302, {
            "location": fullUrl
        });
        res.end();
    }
})

router.get('/leaderboards', (req, res) => {

    let allGames = gameEnv.allGames;
    let gamesCopy = JSON.parse(JSON.stringify(allGames));
    let gameArray = [];
    for(let key in gamesCopy){
        gameArray.push(gamesCopy[key]);
    }
    gameArray.sort((a, b) => (a.score < b.score) ? 1 : -1)

    // populate the object in 2nd parameter to pass value in gambelobby page
    res.render('gameLeaderBoard', {
        "gameObj": gameArray
    });
});

module.exports = router;