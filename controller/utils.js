const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

const utils = {
    genRandomName: function () {
        let name = uniqueNamesGenerator({
            dictionaries: [names],
            style: 'capital'
        });
        return name.replace("_", " ");
    }
}

module.exports = utils;

