define([
    'jquery',
    'servidor'
], function($, servidor) {
    $(function() {
        $('#datosUsuario').submit(function(e) {
            e.preventDefault();
            var params = {
                usuario: $('#usuario').val(),
                password: $('#password').val(),
            };
            servidor.autentificarCliente(params, function(data) {
                if (!data.autentificado) {
                    $('#modalOverlay').show();
                    $('#modalResult h6').html(data.mensaje);
                    $('#modalResult').show();
                    return;
                }
                location.href = 'dashboard.html';
            });
        });

        $('#modalResultButton').click(function() {
            $('#modalOverlay').hide();
            $('#modalResult').hide();
        });
    });
});