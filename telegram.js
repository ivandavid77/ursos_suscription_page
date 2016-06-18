module.exports = function(config) {
    var tg = require('telegram-node-bot')(config.TELEGRAM_API_KEY);

    tg.router
        .when(['/start'], 'StartController');

    tg.controller('StartController', function($) {
        tg.for('/start', function($) {
            $.sendMessage($.chatId);
        });
    });

    var externalAPI = {
    };

    return externalAPI;
}