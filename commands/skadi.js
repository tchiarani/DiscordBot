const axios = require('axios');

module.exports = {
    name: 'skadi',
    description: ['Affiche la ToDoList du projet Skadi'],
    usage: [''],
    alias: [''],
    execute(client, message, args, data) {

        // Make a request for a user with a given ID
        axios.get('https://trello.com/b/Tq88EA4I.json')
            .then(function(response) {
                console.log(response);
                console.log(response.data.lists.limits);
                console.log(response.data.lists.limits.cards);
            })
            .catch(function(error) {
                console.log(error);
            });

    }
}