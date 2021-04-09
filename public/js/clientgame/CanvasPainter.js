class CanvasPainter {
    constructor(canvas, gameModel) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._ammoDrawer = new PrimaryAmmo(canvas, null);

        this._gameModel = gameModel;
    }

    drawAmmos(ammos) {
        for (let i = 0; i < ammos.length; i++) {
            let ammo = ammos[i];
            // remove ammo if over the canvas boudary
            if (ammo._y < 0) {
                ammos.splice(i, 1);
            } else {
                this._ammoDrawer.setProperty(ammo);
                this._ammoDrawer.draw();
            }
        }
    }

    drawSpaceships() {
        let spaceships = this._gameModel.spacecrafts.values();
        for (let spaceship of spaceships) {
            spaceship.draw();
            spaceship.update();
            this.drawAmmos(spaceship._property._firedAmmos);
        }
    }

    drawAsteroids() {
        let asteroids = this._gameModel.asteroids;
        let controllers = this._gameModel.asteroidControllers;

        for (let asteroid of asteroids.values()) {

            let y = asteroid._property._y;
            // if out of canvas
            if (y > this._canvas.height) {
                asteroids.delete(asteroid._property._id);
                controllers.delete(asteroid._property._id);
            } else {
                asteroid.draw();
            }
        }
    }

    clearCanvas() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
}