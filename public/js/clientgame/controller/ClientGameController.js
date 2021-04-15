class ClientGameController {
    constructor(canvas, clientSocket, gameModel) {
        this._canvas = canvas;
        this._clientSocket = clientSocket;
        this._gameModel = {};
        this._gameCanvasModel = gameModel;

        this._gameOverDisplayed = false;
    }

    initialize(gameData) {
        let canvas = this._canvas;
        let clientSocket = this._clientSocket;
        let gameModel = this._gameCanvasModel;
        let gameCanvasData = gameData.canvasData;
        this._gameModel = gameData;
        this._gameModel.canvasData = this._gameCanvasModel;


        for (let spacecraftData of gameCanvasData.spacecrafts) {
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

        for (let asteroidData of gameCanvasData.asteroids) {
            this.createAsteroid(asteroidData);
        }

        // initialize players in game Panel
        for (let spacecraftData of gameCanvasData.spacecrafts) {
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
            this._gameModel.score = score;
            setTeamScore(score);
        });
        this._clientSocket.on(sockConst.UPDATE_PLAYER_LIFE, (sessionId, currentLife) => {
            let spaceship = this._gameCanvasModel.spacecrafts.get(sessionId);
            if (spaceship) {
                spaceship._property._currentLife = currentLife;
            }
            updatePlayerLife(sessionId, currentLife);
        });
        this._clientSocket.on(sockConst.PLAYER_IS_IMMUNE, (sessionId, immuneFlag) => {
            let spaceship = this._gameCanvasModel.spacecrafts.get(sessionId);
            if (spaceship) {
                spaceship._property._immune = immuneFlag;
            }
        });
        this._clientSocket.on(sockConst.PLAYER_DESTROYED, (sessionId) => {
            let spaceship = this._gameCanvasModel.spacecrafts.get(sessionId);
            if (spaceship) {
                spaceship._property._status = OBJECT_STATUS.DESTROYED;
                spaceship._property._currentLife = 0;
            }
        });
        this._clientSocket.on(sockConst.LAST_ENEMY_DEPLOYED, () => {
            this._gameCanvasModel.lastEnemyDeployed = true;
        });
        this._clientSocket.on(sockConst.GAME_OVER, (totalScore) => {
            this._gameModel.score = totalScore;
            this._gameModel.isGameOver = true;
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

        this._gameCanvasModel.asteroids.set(asteroid._property._id, asteroid);
        this._gameCanvasModel.asteroidControllers.set(asteroid._property._id, cont);
    }

    moveModelObjects() {
        // move spacecrafts
        let controllers = this._gameCanvasModel.spacecraftControllers.values();
        for (let controller of controllers) {
            controller.control();
        }

        // move asteroids
        controllers = this._gameCanvasModel.asteroidControllers;
        controllers.forEach(function (controller) {
            if (controller._asteroid._property._status === OBJECT_STATUS.EXIST) {
                controller.control();
            }
        });
    }

    sendModelObjectMovement() {
        // move spacecrafts
        let controllers = this._gameCanvasModel.spacecraftControllers.values();
        for (let controller of controllers) {
            controller.sendPendingMovement();
        }
    }

    // a method for checking if an object should be removed on the servers Game Model
    cleanUpGameObj() {
        let asteroids = this._gameCanvasModel.asteroids;
        let controllers = this._gameCanvasModel.asteroidControllers;

        for (let asteroid of asteroids.values()) {
            let y = asteroid._property._y;
            // if out of canvas
            if (y > this._canvas.height) {
                this._clientSocket.emit(sockConst.CLEANUP_ASTEROID, asteroid._property._id);
                asteroids.delete(asteroid._property._id);
                controllers.delete(asteroid._property._id);
            }
        }
    }


    // check if Game is Over
    isGameOver() {
        let gameModel = this._gameModel;
        let gameCanvasModel = this._gameCanvasModel;
        if (gameModel.isGameOver && !this._gameOverDisplayed) {
            setTeamScore(this._gameModel.score);
            displayGameOver(this._gameModel);
            this._gameOverDisplayed = true;
        } else {
            if (gameCanvasModel.lastEnemyDeployed) {
                // check if there are enemy left in the Screen
                let asteroids = this._gameCanvasModel.asteroids;
                if (asteroids.size === 0) {
                    this._clientSocket.emit(sockConst.GAME_OVER);
                }
            }
        }
    }

    updateServer() {
        let asteroids = this._gameCanvasModel.asteroids;
        let asteroidArray = [];

        for (let ast of asteroids.values()) {
            let astProp = ast._property;
            asteroidArray.push(astProp);
        }

        // update the server on the current positon of asteroid in canvas
        this._clientSocket.emit(sockConst.UPDATE_ASTEROID, JSON.stringify(asteroidArray));
    }

    // check if asteroid is hit
    asteroidIsHit() {
        let asteroids = this._gameCanvasModel.asteroids;
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
        let spaceships = this._gameCanvasModel.spacecrafts.values();
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
        let asteroids = Array.from(this._gameCanvasModel.asteroids.values());
        let spaceships = this._gameCanvasModel.spacecrafts.values();
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
                            shipProp._currentLife = 0;
                            shipProp._status = OBJECT_STATUS.DESTROYED;
                            clientControllerObj._clientSocket.emit(sockConst.PLAYER_DESTROYED, shipProp._sessionId);
                        } else {

                            shipProp._immune = true;
                            clientControllerObj._clientSocket.emit(sockConst.PLAYER_IS_IMMUNE, shipProp._sessionId);
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
        let asteroid = this._gameCanvasModel.asteroids.get(asteroidId);
        if (asteroid) {
            asteroid._property._status = OBJECT_STATUS.DESTROYED;
        }
        let thisObj = this;
        setTimeout(function () {
            thisObj._gameCanvasModel.asteroids.delete(asteroidId);
            thisObj._gameCanvasModel.asteroidControllers.delete(asteroidId);
        }, 2500);
    }
}