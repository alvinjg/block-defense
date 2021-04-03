class ClientGameController {
    constructor(canvas, clientSocket, gameModel) {
        this._canvas = canvas;
        this._clientSocket = clientSocket;
        this._gameModel = gameModel;

    }

    initialize(gameData){
        let canvas = this._canvas;
        let clientSocket = this._clientSocket;
        let gameModel = this._gameModel;

        for (let spacecraftData of gameData.spacecrafts) {
            // copy spacecraftData to property object
            let spaceshipProp = new SpacecraftProperty();
            for(let key in spacecraftData){
                spaceshipProp[key] = spacecraftData[key];
            }

            let spaceship1 = new Spacecraft(canvas, spaceshipProp);
            let cont = new SpacecraftController(spaceship1, clientSocket);

            let id = spaceship1._property._sessionId;
            gameModel.spacecrafts.set(id, spaceship1);
            gameModel.spacecraftControllers.set(id, cont);
        }

        for (let asteroidData of gameData.asteroids) {
            // copy asteroidData to property object
            let asteroidProp = new AsteroidProperty();
            for(let key in asteroidData){
                asteroidProp[key] = asteroidData[key];
            }

            let asteroid = new Asteroid(canvas, asteroidProp);
            let cont = new AsteroidController(asteroid, clientSocket);

            gameModel.asteroids.push(asteroid);
            gameModel.asteroidControllers.push(cont);
        }
    }

    // create intial enemy units
    createEnemy() {
        let canvas = this._canvas;
        let astProp = new AsteroidProperty();
        let ast1 = new Asteroid(canvas, astProp);
        let cont = new AsteroidController(ast1);

        this._gameModel.asteroids.push(ast1);
        this._gameModel.asteroidControllers.push(cont);
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
            controller.control();
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
        let controllers = this._gameModel.asteroidControllers;

        for (let j = 0; j < asteroids.length; j++) {
            let asteroid = asteroids[j];

            this.spaceshipBulletHits(function (ammo, indx, ammos) {
                let collided = asteroid.isCollided(ammo._x, ammo._y, ammo._radius);
                if (collided) {
                    asteroid.hit(ammo._damage);
                    ammos.splice(indx, 1); // remove the bullet that hit
                    indx--;
                    // asteroid is destroyed
                    if (asteroid._property._currentLife <= 0) {
                        asteroids.splice(j, 1);

                        // if asteroid has controller delete it
                        if (asteroid._controller) {
                            let i = controllers.findIndex((element) => element === asteroid._controller);
                            controllers.splice(i, 1);
                        }
                    }
                }
            });
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

    // get the distance using pythagorean theorem
    getDistance(x1, y1, x2, y2) {
        let xDistance = Math.abs(x2 - x1);
        let yDistance = Math.abs(y2 - y1);

        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }
}