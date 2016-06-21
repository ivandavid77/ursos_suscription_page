module.exports = function(config) {
    var mysql = require('mysql');
    var pool = mysql.createPool({
        connectionLimit : config.DB_POOL_CONNECTIONS,
        host : config.DB_HOST,
        user : config.DB_USER,
        password : config.DB_PASSWORD,
        database : config.DB_NAME
    });

    var externalAPI = {
        autentificarCliente: require('./db/autentificarCliente.js')(pool, config),
        crearCliente: require('./db/crearCliente.js')(pool, config),
        obtenerCliente: require('./db/obtenerCliente.js')(pool, config),
    };

    return externalAPI;
};