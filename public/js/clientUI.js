
const createGameForm = document.querySelector("#createGameForm");
const joinGameForm = document.querySelector("#joinGameForm");

function setHome_playerName(name){
    if(createGameForm){
        let input = createGameForm.querySelector('input[name="leader"]');
        if(input){
            input.setAttribute("value", name);
        }
    }
    if(joinGameForm){
        let input = joinGameForm.querySelector('input[name="playerName"]');
        if(input){
            input.setAttribute("value", name);
        }
    }
}

function setHome_sessionId(sessionId){
    if(createGameForm){
        let input = createGameForm.querySelector('input[name="sessionId"]');
        if(input){
            input.setAttribute("value", sessionId);
        }
    }
    if(joinGameForm){
        let input = joinGameForm.querySelector('input[name="sessionId"]');
        if(input){
            input.setAttribute("value", sessionId);
        }
    }
}
