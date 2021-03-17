const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    teamName: {
        type: String,
        required: true
    },
    leader: {
        type: String,
        required: true
    },
    gameID: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {timestamps:true});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
