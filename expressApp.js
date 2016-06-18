module.exports = function(db, telegram, config) {

    function enviarJSON(res, obj) {
        res.writeHead(200, { 'Content-Type' : 'application/json' });
        res.write(JSON.stringify(obj));
        res.end();
    }

    var express = require('express');
    var session = require('express-session');
    var bodyParser = require('body-parser');
    var app = express();
    var http = require('http');
    var server = http.Server(app);
    var crypto = require('crypto');
    var uuid = require('node-uuid');
    var handlebars = require('express-handlebars').create({
        defaultLayout : 'main',
    });

    app.set('port', config.HTTP_PORT);
    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');
    app.use(
        session({
            genid: function(req) {
                return crypto
                    .createHash('sha256')
                    .update(uuid.v1())
                    .update(crypto.randomBytes(256))
                    .digest('hex');
            },
            resave: false,
            saveUninitialized: true,
            secret: 'Fggg1212aQQ1q45ggthsikelLedueCCv89'
        })
    );
    app.use(bodyParser.urlencoded( { extended: false } ));
    app.use(bodyParser.json());
    app.use(express.static(__dirname + '/public'));
    
    app.post('/autentificar_usuario', (req, res) => {
        var session = req.session;
        var usuario = req.body.usuario;
        var password = req.body.password;
        enviarJSON(res, {autentificado: false});
    });

    
    app.use((req, res) => {
        res.status(404);
        res.render('404');
    });

    app.use((err, req, res, next) => {
        console.log(err.stack);
        res.status(500);
        res.render('500');
    });

    function run() {
        server.listen(
            app.get('port'),
            () => console.log('Aplicacion iniciada: '+app.get('port'))
        );
    }

    var externalAPI = {
        server : server,
        run : run,
    };

    return externalAPI;
}