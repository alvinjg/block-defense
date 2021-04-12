

const gameModel = {
    "spacecrafts": new Map(),
    "spacecraftControllers": new Map(),
    "asteroids": new Map(),
    "asteroidControllers": new Map()
};

const initGameCanvas = (canvas, clientSocket, myGameSession) => {
    let canvasPainterIntervalId = 0;
    let canvasControllerIntervalId = 0;
    let userControlIntervalId = 0;
    let cleanUpIntervalId = 0;
    let updateServerIntervalId = 0;

    clientSocket.emit(sockConst.INIT_GAME_CANVAS, myGameSession.id);
    clientSocket.on(sockConst.INIT_GAME_CANVAS, (gameCanvasData) => {
        let gameData = JSON.parse(gameCanvasData);

        const gameController = new ClientGameController(canvas, clientSocket, gameModel);
        gameController.initialize(gameData);

        const painter = new CanvasPainter(canvas, gameModel);

        // interval for drawing in canvas
        canvasPainterIntervalId = setInterval(() => {
            painter.clearCanvas();
            painter.drawSpaceships();
            painter.drawAsteroids();

            gameController.asteroidIsHit();
            gameController.spachipIsHit();
        }, 15);

        // interval for moving objects in canvas; Required to see movement in canvas
        canvasControllerIntervalId = setInterval(() => {
            gameController.moveModelObjects();
        }, 15);

        // interval for clean up of canvas object 
        cleanUpIntervalId = setInterval(() => {
            gameController.cleanUpGameObj();
        }, 250);

        // interval for updating the server
        updateServerIntervalId = setInterval(() => {
            gameController.updateServer();
            gameController.isGameOver();
        }, 500);

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
    });

};