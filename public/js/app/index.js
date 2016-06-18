define([
    'jquery'
], function($) {
    $(function() {
        $('#datosUsuario').submit(function(e) {
            e.preventDefault();
            var params = {
                usuario: $('#usuario').val(),
                password: $('#password').val(),
            };
            console.log(params);
            $.post('autentificar_usuario', params, function(data) {
                if (!data.autentificado) {
                    $('#modalOverlay').show();
                    $('#modalResult h6').html('Verifique su usuario y su contrase&ntilde;a');
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