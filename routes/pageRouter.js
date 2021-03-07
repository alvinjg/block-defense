const express = require('express');
const router = express.Router();

// redirect user to 'views/home.handlebars' page
router.get('/', (req, res)=>{
    // populate the object in 2nd parameter to pass value in homepage
    res.render('home', {});
});


// redirect to gamelobby page
router.get('/gamelobby/:id', (req, res)=>{
    const gameid = req.params.id;

    // populate the object in 2nd parameter to pass value in gambelobby page
    res.render('gameLobby', {
        gameid: gameid
    });
});

module.exports = router;