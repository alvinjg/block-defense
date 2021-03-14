
const homeBody = document.querySelector("#home-body");
const createGameForm = document.querySelector("#createGameForm");
const joinGameForm = document.querySelector("#joinGameForm");
const startGame = document.querySelector("#startGame");
const playerContainer = document.querySelector(".team-container .players");

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

function setLobby_hideStartGame(sessionId) {
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
            
            let div = document.createElement('div');
            div.classList.add('tile');
            div.innerText = player.name;
            if(player.id === myGameSession.id){
                div.classList.add('my-player');
            }
    
            playerContainer.appendChild(div);
        }
    }
}
 
function setLobby_removeAllPlayerTile() {
    // remove all child
    while (playerContainer.firstChild) {
        playerContainer.removeChild(playerContainer.firstChild);
    }
}