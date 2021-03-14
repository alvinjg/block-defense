
const createGameForm = document.querySelector("#createGameForm");

function setHome_playerName(name){
    if(createGameForm){
        let input = createGameForm.querySelector('input[name="leader"]');
        if(input){
            input.setAttribute("value", name);
        }
    }
}

function setLobby_teamName(){

}
