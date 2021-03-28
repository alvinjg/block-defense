

const gameModel = {
    "spacecrafts": new Map(),
    "spacecraftControllers": new Map(),
    "asteroids": [],
    "asteroidControllers": []
};

const initGameCanvas = (canvas, clientSocket, myGameSession) => {
    let canvasPainterIntervalId = 0;
    let canvasControllerIntervalId = 0;
    let userControlIntervalId = 0;

    clientSocket.emit(sockConst.INIT_GAME_CANVAS, myGameSession.id);
    clientSocket.on(sockConst.INIT_GAME_CANVAS, (gameCanvasData) => {
        let gameData = JSON.parse(gameCanvasData);

        if (gameData.spacecrafts) {
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

            const gameController = new ClientGameController(canvas, gameModel);
            const painter = new CanvasPainter(canvas, gameModel);

            // interval for drawing in canvas
            canvasPainterIntervalId = setInterval(() => {
                painter.clearCanvas();
                painter.drawSpaceships();
                painter.drawAsteroids();

                gameController.asteroidIsHit();
            }, 15);

            // interval for moving objects in canvas; Required to see movement in canvas
            canvasControllerIntervalId = setInterval(() => {
                gameController.moveModelObjects();
            }, 15);

            // interval for sending movement of objects to server
            userControlIntervalId = setInterval(() => {
                gameController.sendModelObjectMovement();
            }, 100);

            // control only the client spacecraft
            document.addEventListener('keydown', (event) => {
                let controller = gameModel.spacecraftControllers.get(myGameSession.id);
                controller.onKeyDown(event);
            });

            // control only the client spacecraft
            document.addEventListener('keyup', (event) => {
                let controller = gameModel.spacecraftControllers.get(myGameSession.id);
                controller.onKeyUp(event);
            });
        }

    });

};