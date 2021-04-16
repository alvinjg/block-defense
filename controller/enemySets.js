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
        "L3": 3,
        "L4": 4
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

        // compute inverse propostionality of speed to radius
        let constantProportionality = defaultAsteroid._speed_y * defaultAsteroid._radius;
        let downSpeed = constantProportionality / radius;

        if (ratioFromDefault > 1.5 && ratioFromDefault <= 2) {
            fullLife *= 3;
            scoreVal *= 3;
        } else if (ratioFromDefault > 2 && ratioFromDefault <= 4) {
            fullLife *= 4.5;
            scoreVal *= 4.5;
        } else if (ratioFromDefault > 4 && ratioFromDefault <= 6) {
            fullLife *= 7;
            scoreVal *= 7;
        } else if (ratioFromDefault > 6) {
            fullLife *= 25;
            scoreVal *= 25;
        }
        scoreVal = Math.floor(scoreVal);
        fullLife = Math.floor(fullLife);


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
                asteroid._speed_x = 0.7;
                let randMove = Math.random() > 0.3;
                if (randMove) {
                    asteroid._movementType = obj.MOVEMENT_TYPE.ZIGZAG;
                }
                group.asteroids.push(asteroid);
            }
            enemyGroups.push(group);
        }

        if (ENEMY_LEVEL.L2 === level) {
            let asteroidNum = Math.round(Math.random() * 3) + 1;
            for (let i = 0; i < asteroidNum; i++) {
                let group = newGroup();
                group.attackTime = elapsed + (Math.random() * 2000);

                let size = Math.floor(30 + (Math.random() * defaultAsteroid._radius));
                let asteroid = newAsteroid(size);
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

                let size = Math.floor(60 + (Math.random() * (defaultAsteroid._radius * 2)));
                let asteroid = newAsteroid(size);
                group.asteroids.push(asteroid);

                enemyGroups.push(group);
                nextAttack = elapsed + delay + (Math.random() * 3000);
            }
        }

        if (ENEMY_LEVEL.L4 === level) {
            let asteroidNum = 1;
            for (let i = 0; i < asteroidNum; i++) {
                let group = newGroup();
                group.attackTime = elapsed + (Math.random() * 2000);

                let size = Math.floor(120 + (Math.random() * defaultAsteroid._radius));
                let asteroid = newAsteroid(size);
                group.asteroids.push(asteroid);

                enemyGroups.push(group);
                nextAttack = elapsed + delay + (Math.random() * 3000);
            }
        }

        return nextAttack;
    }

    let maxDuration = 300000;
    let stage1End = Math.floor(maxDuration * 0.75);
    let stage2End = maxDuration;

    let nextAttack = 3000;
    let nextAttack2 = 15000;
    let nextAttack3 = 30000;
    let nextAttack4 = 45000;
    for (let elapsed = 300; elapsed <= stage1End; elapsed += 100) {
        if (nextAttack < elapsed) {
            nextAttack = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L1);
        }
        if (nextAttack2 < elapsed) {
            nextAttack2 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L2, 10000);
        }
        if (nextAttack3 < elapsed) {
            nextAttack3 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L3, 20000);
        }
        if (nextAttack4 < elapsed) {
            nextAttack4 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L4, 35000);
        }
    }

    let timeout = 10000;
    nextAttack += timeout;
    nextAttack2 += timeout;
    nextAttack3 += timeout;
    nextAttack4 += timeout;
    for (let elapsed = (stage1End + timeout); elapsed <= stage2End; elapsed += 100) {
        if (nextAttack < elapsed) {
            nextAttack = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L1);
            nextAttack = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L1);
        }

        if (nextAttack2 < elapsed) {
            nextAttack2 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L2, 25000);
        }
        if (nextAttack4 < elapsed) {
            nextAttack4 = attackCreator(elapsed, enemyGroups, ENEMY_LEVEL.L4, 20000);
        }
    }

    // last big asteroid
    let group = newGroup();
    group.attackTime = (stage1End + 5000);
    let asteroid = newAsteroid(220);
    group.asteroids.push(asteroid);
    enemyGroups.push(group);

    enemyGroups.sort((a, b) => (a.attackTime > b.attackTime) ? 1 : -1)
    return enemyGroups;
};

const newEnemySets = enemyFactory();

module.exports = newEnemySets;