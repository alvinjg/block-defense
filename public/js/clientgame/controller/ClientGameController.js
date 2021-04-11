class ClientGameController {
    constructor(canvas, clientSocket, gameModel) {
        this._canvas = canvas;
        this._clientSocket = clientSocket;
        this._gameModel = gameModel;

    }

    initialize(gameData) {
        let canvas = this._canvas;
        let clientSocket = this._clientSocket;
        let gameModel = this._gameModel;

        for (let spacecraftData of gameData.spacecrafts) {
            // copy spacecraftData to property object
            let spaceshipProp = new SpacecraftProperty();
            for (let key in spacecraftData) {
                spaceshipProp[key] = spacecraftData[key];
            }

            let spaceship1 = new Spacecraft(canvas, spaceshipProp);
            let cont = new SpacecraftController(spaceship1, clientSocket);

            let id = spaceship1._property._sessionId;
            gameModel.spacecrafts.set(id, spaceship1);
            gameModel.spacecraftControllers.set(id, cont);
        }

        for (let asteroidData of gameData.asteroids) {
            this.createAsteroid(asteroidData);
        }

        // initialize players in game Panel
        for (let spacecraftData of gameData.spacecrafts) {
            updatePlayerLife(spacecraftData._sessionId, spacecraftData._currentLife);
        }

        this.initServerEvents();
    }

    // respond from the events send from the server
    initServerEvents() {
        let clientControllerObj = this;

        this._clientSocket.on(sockConst.ASTEROID_DESTROYED, (asteroidId) => {
            this.deleteAsteroid(asteroidId);
        });
        this._clientSocket.on(sockConst.NEW_ENEMY_ATTACK, (enemyGroup) => {
            enemyGroup = JSON.parse(enemyGroup);
            enemyGroup.asteroids.forEach(function (value) {
                clientControllerObj.createAsteroid(value);
            });
        });
        this._clientSocket.on(sockConst.UPDATE_TEAM_SCORE, (score) => {
            setTeamScore(score);
        });
        this._clientSocket.on(sockConst.UPDATE_PLAYER_LIFE, (sessionId, currentLife) => {
            updatePlayerLife(sessionId, currentLife);
        });
        this._clientSocket.on(sockConst.PLAYER_IS_IMMUNE, (sessionId, immuneFlag) => {
            let spaceship = this._gameModel.spacecrafts.get(sessionId);
            if (spaceship) {
                spaceship._property._immune = immuneFlag;

            }
        });
        this._clientSocket.on(sockConst.PLAYER_DESTROYED, (sessionId) => {
            let spaceship = this._gameModel.spacecrafts.get(sessionId);
            if (spaceship) {
                spaceship._property._status = OBJECT_STATUS.DESTROYED;
            }
        });
    }

    // create an Asteroid that the player will fight. The created Asteroid and its controller is added to the game model.
    createAsteroid(asteroidData) {
        let canvas = this._canvas;
        let astProp = new AsteroidProperty();

        // copy asteroidData to property object
        for (let key in asteroidData) {
            astProp[key] = asteroidData[key];
        }

        let asteroid = new Asteroid(canvas, astProp);
        let cont = new AsteroidController(asteroid, this._clientSocket);

        this._gameModel.asteroids.set(asteroid._property._id, asteroid);
        this._gameModel.asteroidControllers.set(asteroid._property._id, cont);
    }

    moveModelObjects() {
        // move spacecrafts
        let controllers = this._gameModel.spacecraftControllers.values();
        for (let controller of controllers) {
            controller.control();
        }

        // move asteroids
        controllers = this._gameModel.asteroidControllers;
        controllers.forEach(function (controller) {
            if (controller._asteroid._property._status === OBJECT_STATUS.EXIST) {
                controller.control();
            }
        });
    }

    sendModelObjectMovement() {
        // move spacecrafts
        let controllers = this._gameModel.spacecraftControllers.values();
        for (let controller of controllers) {
            controller.sendPendingMovement();
        }
    }



    // check if asteroid is hit
    asteroidIsHit() {
        let asteroids = this._gameModel.asteroids;
        let clientControllerObj = this;

        for (let asteroid of asteroids.values()) {

            if (OBJECT_STATUS.EXIST === asteroid._property._status) {
                this.spaceshipBulletHits(function (ammo, indx, ammos) {
                    let collided = asteroid.isCollided(ammo._x, ammo._y, ammo._radius);
                    if (collided) {
                        asteroid.hit(ammo._damage);
                        ammos.splice(indx, 1); // remove the bullet that hit
                        indx--;
                        // asteroid is destroyed
                        if (asteroid._property._currentLife <= 0) {
                            clientControllerObj._clientSocket.emit(sockConst.ASTEROID_DESTROYED, asteroid._property._id);
                            clientControllerObj.deleteAsteroid(asteroid._property._id);
                        }
                    }
                });
            }
        }
    }

    // Check if spaceship bullet if it hits an object
    spaceshipBulletHits(callback) {
        let spaceships = this._gameModel.spacecrafts.values();
        for (let spaceship of spaceships) {
            let ammos = spaceship._property._firedAmmos;
            let indx = 0;
            while (ammos.length > indx) {
                let ammo = ammos[indx];
                callback(ammo, indx, ammos);
                indx++;
            }
        }
    }

    spachipIsHit() {
        let asteroids = Array.from(this._gameModel.asteroids.values());
        let spaceships = this._gameModel.spacecrafts.values();
        let clientControllerObj = this;

        for (let spaceship of spaceships) {

            for (let i = 0; i < asteroids.length; i++) {
                let asteroid = asteroids[i];
                if (OBJECT_STATUS.EXIST === asteroid._property._status) {
                    // check if spaship collides with asteroid
                    let collided = spaceship.isCollided(asteroid._property._x, asteroid._property._y, asteroid._property._radius);
                    let shipProp = spaceship._property;
                    if (collided && !shipProp._immune) {
                        spaceship.hit(asteroid._property._damage);

                        // delete player if Destroyed
                        if (shipProp._currentLife <= 0) {
                            shipProp._status = OBJECT_STATUS.DESTROYED;
                            clientControllerObj._clientSocket.emit(sockConst.PLAYER_DESTROYED, shipProp._sessionId);
                        } else {

                            // immune for 2.5 seconds when hit by asteroid
                            shipProp._immune = true;
                            clientControllerObj._clientSocket.emit(sockConst.PLAYER_IS_IMMUNE, shipProp._sessionId, true);
                            setTimeout(function () {
                                clientControllerObj._clientSocket.emit(sockConst.PLAYER_IS_IMMUNE, shipProp._sessionId, false);
                            }, 2500);
                        }

                        // notify every one that player is hit
                        clientControllerObj._clientSocket.emit(sockConst.UPDATE_PLAYER_LIFE, shipProp._sessionId, shipProp._currentLife);
                    }
                }
            }
        }


    }

    // get the distance using pythagorean theorem
    getDistance(x1, y1, x2, y2) {
        let xDistance = Math.abs(x2 - x1);
        let yDistance = Math.abs(y2 - y1);

        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    deleteAsteroid(asteroidId) {
        let asteroid = this._gameModel.asteroids.get(asteroidId);
        if (asteroid) {
            asteroid._property._status = OBJECT_STATUS.DESTROYED;
        }
        let thisObj = this;
        setTimeout(function () {
            thisObj._gameModel.asteroids.delete(asteroidId);
            thisObj._gameModel.asteroidControllers.delete(asteroidId);
        }, 2500);
    }
}