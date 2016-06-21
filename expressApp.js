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
    

    app.post('/autentificar_cliente', function(req, res) {
        var session = req.session;
        session.cliente = null;
        var usuario = req.body.usuario;
        var password = req.body.password;
        db.autentificarCliente(usuario, password, function(err, cliente) {  
            var respuesta = {
                autentificado: false,
            };
            if (err) {
                respuesta.mensaje = err;    
            } else {
                respuesta.autentificado = true;
                session.cliente = cliente;
            }
            respuesta.cliente = session.cliente;
            enviarJSON(res, respuesta);
        });
    });

    app.get('/obtener_datos_cliente', function(req, res) {
        var session = req.session;
        enviarJSON(res, {
            autentificado: (session.cliente)? true : false,
            cliente: session.cliente,
        });
    });

    app.post('/crear_cliente', function(req, res) {
        var session = req.session;
        if ('cliente' in req.body) {
	        var cliente = req.body.cliente;
            db.crearCliente(cliente, function(err, id_cliente) {
                session.cliente = null;
                if (err) {
                    enviarJSON(res, {
                        creado: false,
                        mensaje: err,
                    });
                    return;
                }
                db.obtenerCliente(id_cliente, function(err, cliente) {
                    if (err) {
                        console.log(err);
                        enviarJSON(res, {
                            creado: false,
                            mensaje: config.GENERIC_ERROR,
                        });
                        return;
                    }
                    session.cliente = cliente;
                    enviarJSON(res, {
                        creado: true,
                    });
                });
            });
        }
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