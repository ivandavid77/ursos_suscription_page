define('servidor', [
    'jquery',
    'config'
], function($, config) {

    function autentificarCliente(params, callback) {
        return $.post('autentificar_cliente', params, callback);
    }
    
    function obtenerDatosCliente(callback) {
        return $.get('obtener_datos_cliente', callback);
    }

    function crearCliente(params, callback) {
        return $.ajax({
            type: 'POST',
            data: JSON.stringify(params),
            contentType: 'application/json',
            url: 'crear_cliente',
            complete: function(data) {callback(data.responseJSON);}
        });
    }

    function actualizarCliente(params, callback) {
        return $.ajax({
            type: 'POST',
            data: JSON.stringify(params),
            contentType: 'application/json',
            url: 'actualizar_cliente',
            complete: function(data) {callback(data.responseJSON);}
        });
    }

    var externalAPI = {
        autentificarCliente : autentificarCliente,
        obtenerDatosCliente : obtenerDatosCliente,
        crearCliente : crearCliente,
        actualizarCliente: actualizarCliente,
        promise : {
               
        }
    };
    return externalAPI;
});