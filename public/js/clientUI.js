
const homeBody = document.querySelector("#home-body");
const gameLobbyBody = document.querySelector("#game-lobby-body");
const gamePageBody = document.querySelector("#game-page-body");
const createGameForm = document.querySelector("#createGameForm");
const joinGameForm = document.querySelector("#joinGameForm");
const startGame = document.querySelector("#startGame");
const playerContainer = document.querySelector(".team-container .players");
const pingNum = document.querySelector("#ping span:first-child");


function setHome_display() {
    if (homeBody) {
        homeBody.querySelector(".container").classList.remove("d-none");
    }
}

function setHome_playerName(name) {
    if (createGameForm) {
        let input = createGameForm.querySelector('input[name="leader"]');
        if (input) {
            input.setAttribute("value", name);
        }
    }
    if (joinGameForm) {
        let input = joinGameForm.querySelector('input[name="playerName"]');
        if (input) {
            input.setAttribute("value", name);
        }
    }
}

function setHome_sessionId(sessionId) {
    if (createGameForm) {
        let input = createGameForm.querySelector('input[name="sessionId"]');
        if (input) {
            input.setAttribute("value", sessionId);
        }
    }
    if (joinGameForm) {
        let input = joinGameForm.querySelector('input[name="sessionId"]');
        if (input) {
            input.setAttribute("value", sessionId);
        }
    }
}

function setLobby_display() {
    if (gameLobbyBody) {
        gameLobbyBody.querySelector(".container").classList.remove("d-none");
    }
}

function setLobby_showStartGame(sessionId) {
    if (startGame) {
        let leader = startGame.getAttribute('data-leader');
        if (leader === sessionId) {
            startGame.classList.remove("d-none");
        }
    }
}

function setLobby_refreshPlayerTile(players) {
    if (playerContainer) {
        setLobby_removeAllPlayerTile();
        for (let i = 0; i < players.length; i++) {
            let player = players[i];

            if (player.isConnected) {
                let div = document.createElement('div');
                div.classList.add('tile');
                div.innerText = player.name;
                div.style.backgroundColor = player.color + "6e";
                if (player.id === myGameSession.id) {
                    div.classList.add('my-player');
                }

                playerContainer.appendChild(div);
            }
        }
    }
}

function setLobby_removeAllPlayerTile() {
    // remove all child
    while (playerContainer.firstChild) {
        playerContainer.removeChild(playerContainer.firstChild);
    }
}

function setGamePage_display() {
    if (gamePageBody) {
        gamePageBody.querySelector(".container").classList.remove("d-none");
    }
}

function displayPing(pingMs) {
    if (pingNum) {
        pingNum.className = "";

        if(pingMs < 300){
            pingNum.classList.add("green");
        }else if(pingMs < 400){
            pingNum.classList.add("amber");
        }else{
            pingNum.classList.add("red");
        }
        if(pingMs > 999){
            pingMs = 999;
        }
        pingNum.innerHTML = pingMs + "ms";
    }
}