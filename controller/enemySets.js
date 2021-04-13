const obj = require("./gameObjectsProperty");
const uuid = require('uuid');
const gameEnv = require('./gameEnvironment');

// Creates a list of enemies that will fight the players. Returns array of enemy object to be sent to the players at specific time.
const enemyFactory = function () {
    let canvasInfo = gameEnv.gameCanvasTemplate().canvasInfo;
    let defaultAsteroid = new obj.AsteroidProperty();
    let enemyGroups = [];
    let ENEMY_LEVEL = {
        "L1": 1,
        "L2": 2,
        "L3": 3
    }

    let newGroup = function () {
        return {
            attackTime: 3000,
            asteroids: []
        };
    };

    let newAsteroid = function (radius = defaultAsteroid._radius) {
        let ratioFromDefault = radius / defaultAsteroid._radius;
        let scoreVal = Math.floor(defaultAsteroid._scoreValue * ratioFromDefault);
        let damageVal = Math.floor(defaultAsteroid._damage * ratioFromDefault);
        let fullLife = Math.floor(defaultAsteroid._fullLife * ratioFromDefault);

        if (ratioFromDefault > 1.5 && ratioFromDefault < 2) {
            fullLife *= 3;
            scoreVal *= 3;
        } else if (ratioFromDefault > 3) {
            fullLife *= 3.5;
            scoreVal *= 3.5;
        }
        scoreVal = Math.floor(scoreVal);
        fullLife = Math.floor(fullLife);
        

        // compute inverse propostionality of speed to radius
        let constantProportionality = defaultAsteroid._speed_y * defaultAsteroid._radius;
        let downSpeed = constantProportionality / radius;

        let astProp = new obj.AsteroidProperty();
        astProp._id = uuid.v4();
        astProp._radius = radius;

        let startXRange = (canvasInfo.width - (astProp._radius * 2));
        astProp._x = (Math.random() * startXRange) + astProp._radius;
        astProp._y = -20;
        astProp._speed_y = downSpeed;
        astProp._scoreValue = scoreVal;
        astProp._damage = damageVal;
        astProp._fullLife = fullLife;
        astProp._currentLife = fullLife;

        return astProp;
    };

    let attackCreator = function (elapsed, enemyGroups, level, delay = 3000) {
        let nextAttack = elapsed + delay;

        if (ENEMY_LEVEL.L1 === level) {
            let group = newGroup();
            group.attackTime = elapsed;

            let asteroidNum = 1;
            for (let i = 0; i < asteroidNum; i++) {
                let asteroid = newAsteroid();
                group.asteroids.push(asteroid);
            }
            enemyGroups.push(group);
        }

        if (ENEMY_LEVEL.L2 === level) {
            let asteroidNum = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < asteroidNum; i++) {
                let group = newGroup();
                group.attackTime = elapsed + (Math.random() * 2000);

                let asteroid = newAsteroid(50);
                group.asteroids.push(asteroid);

                enemyGroups.push(group);
                nextAttack = elapsed + delay + (Math.random() * 3000);
            }
        }

        if (ENEMY_LEVEL.L3 === level) {
            let asteroidNum = 1;
            for (let i = 0; i < asteroidNum; i++) {
                let group = newGroup();
                group.attackTime = elapsed + (Math.random() * 2000);

                let asteroid = newAsteroid(100);
                group.asteroids.push(asteroid);

                enemyGroups.push(group);
                nextAttack = elapsed + delay + (Math.random() * 3000);
            }
        }

        return nextAttack;
    }

    let maxDuration = 300000;
    let nextAttack = 3000;
    let nextAttack2 = 15000;
    let nextAttack3 = 30000;
    for (let elapsed = 300; elapsed <= maxDuration; elapsed += 100) {
        if (nextAttack < elapsed) {
            nextAttack = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L1);
        }
        if (nextAttack2 < elapsed) {
            nextAttack2 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L2, 15000);
        }
        if (nextAttack3 < elapsed) {
            nextAttack3 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L3, 30000);
        }
    }

    enemyGroups.sort((a, b) => (a.attackTime > b.attackTime) ? 1 : -1)
    return enemyGroups;
};

const newEnemySets = enemyFactory();

module.exports = newEnemySets;