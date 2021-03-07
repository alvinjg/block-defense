$("#createGame").click(function () {
    $.ajax({
        url: "/api/game/create",
        success: function (data) {
            if (data.gameLobbyUrl) {
                window.location.href = data.gameLobbyUrl;
            } else {
                console.error("Invalid returned data from server.");
            }
        },
        error: function(xhr, ajaxOptions, thrownerror){
            console.error(thrownerror);
        }
    });
});
