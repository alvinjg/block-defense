const obj = require("./gameObjectsProperty");
const uuid = require('uuid');
const gameEnv = require('./gameEnvironment');

// List of enemies that will fight the players. Returns array of enemy object to be sent to the players at specific time.
const newEnemySets = function(){
    let canvasInfo= gameEnv.gameCanvasTemplate().canvasInfo;

    let newGroup = function(){
        return {
            attackTime: 3000,
            asteroids: []   
        };
    };

    let newAsteroid = function(){
        let astProp = new obj.AsteroidProperty();
        astProp._id = uuid.v4();

        astProp._x = Math.floor(canvasInfo.width / 2) - Math.floor(astProp._width / 2);
        astProp._y = -20;

        return astProp;
    };

    let asteroid = null;

    // runs after 5 seconds
    let group1 = newGroup();
    group1.attackTime = 5000;
    asteroid = newAsteroid();
    asteroid._x -= 20;
    group1.asteroids.push(asteroid); 

    // runs after 10 seconds
    let group2 = newGroup();
    group2.attackTime = 10000;
    asteroid = newAsteroid();
    asteroid._x -= 200;
    asteroid._speed_y = 0.2;
    group2.asteroids.push(asteroid); 
    asteroid = newAsteroid();
    asteroid._x += 300;
    asteroid._speed_y = 0.2;
    group2.asteroids.push(asteroid); 
    asteroid = newAsteroid();
    asteroid._x += 150;
    asteroid._speed_y = 0.2;
    group2.asteroids.push(asteroid); 

    // runs after 15 seconds
    let group3 = newGroup();
    group3.attackTime = 15000;
    asteroid = newAsteroid();
    asteroid._x = 20;
    group3.asteroids.push(asteroid); 

     // runs after 25 seconds
     let group4 = newGroup();
     group4.attackTime = 25000;
     asteroid = newAsteroid();
     asteroid._x = 75;
     asteroid._speed_y = 0.6;
     group4.asteroids.push(asteroid);
     asteroid = newAsteroid();
     asteroid._x = 243;
     asteroid._speed_y = 0.1;
     group4.asteroids.push(asteroid);
     asteroid = newAsteroid();
     asteroid._x = 600;
     asteroid._speed_y = 0.7;
     group4.asteroids.push(asteroid);

     // runs after 30 seconds
     let group5 = newGroup();
     group5.attackTime = 30000;
     asteroid = newAsteroid();
     asteroid._x = 700;
     asteroid._speed_y = 0.6;
     group5.asteroids.push(asteroid);


     let group6 = newGroup();
     group6.attackTime = 32000;
     asteroid = newAsteroid();
     asteroid._x = 500;
     asteroid._speed_y = 0.1;
     group6.asteroids.push(asteroid);

    return [
        group1,
        group2,
        group3,
        group4,
        group5,
        group6
    ];
};

module.exports = newEnemySets;