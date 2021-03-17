const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const utils = {
    genRandomName: function () {
        let name = uniqueNamesGenerator({
            dictionaries: [colors, animals],
            style: 'capital'
        });
        return name.replace("_", " ");
    }
}

module.exports = utils;

