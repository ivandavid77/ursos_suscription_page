define([
    'jquery',
    'servidor'
], function($, servidor) {
    function crear() {
        var cliente = {
            usuario: $('#usuario').val(),
            password: $('#password').val(),
            domicilio: $('#domicilio').val(),
            colonia: $('#colonia').val(),
            delegacion: $('#delegacion').val(),
            telefono: $('#telefono').val(),
            telefono_en_domicilio: $('#telefono_en_domicilio').val(),
            tipo: $('#tipo').val(),
            apellido_paterno_propietario: $('#apellido_paterno_propietario').val(),
            apellido_materno_propietario: $('#apellido_materno_propietario').val(),
            nombre_propietario: $('#nombre_propietario').val(),
            id_telegram_propietario: $('#id_telegram_propietario').val().trim(),          
            palabra_secreta: $('#palabra_secreta').val(), 
            pregunta_secreta: $('#pregunta_secreta').val(),
            respuesta_pregunta_secreta: $('#respuesta_pregunta_secreta').val(), 
        };
        if (cliente.tipo == 'EMPRESA') {
            cliente.nombre_encargado = $('#nombre_encargado').val();
            cliente.nombre_establecimiento = $('#nombre_establecimiento').val();
        } 
        if (cliente.id_telegram_propietario == '') {
            cliente.id_telegram_propietario = 0;
        }
        var tmp = [];
        $('#ruteadores input').each(function(router) { 
            tmp.push(this.value);
        });
        cliente.ruteadores = tmp;
        servidor.crearCliente({cliente: cliente}, function(data) {
            if (!data.creado) {
                alert(data.mensaje);
                return;
            }
            location.reload();
        });
    }

    function actualizar() {
        
    }

    function crearNombreUsuario() {
        $('#usuario').val(
            $('#nombre_propietario').val().replace(/\s/g, '')+
            $('#apellido_paterno_propietario').val().replace(/\s/g, '')+
            $('#apellido_materno_propietario').val().replace(/\s/g, '')
        );
    }
    

    servidor.obtenerDatosCliente(function(data) {
        var submitHandler = null;
        var cliente = data.cliente;    
        if (data.autentificado) {
            $('#indicaciones').hide();
            $('#apellido_paterno_propietario').off();
            $('#apellido_materno_propietario').off();
            $('#nombre_propietario').off();
            $('#usuario').prop('disabled', true);
            $('#password').prop('required', false);

            $('#id_cliente').val(cliente.id_cliente);
            $('#usuario').val(cliente.usuario);
            $('#domicilio').val(cliente.domicilio);
            $('#colonia').val(cliente.colonia);
            $('#delegacion').val(cliente.delegacion);
            $('#telefono').val(cliente.telefono);
            $('#telefono_en_domicilio').val(cliente.telefono_en_domicilio);
            $('#tipo').val(cliente.tipo);
            $('#apellido_paterno_propietario').val(cliente.apellido_paterno_propietario);
            $('#apellido_materno_propietario').val(cliente.apellido_materno_propietario);
            $('#nombre_propietario').val(cliente.nombre_propietario);
            if (cliente.id_telegram_propietario == 0)
                $('#id_telegram_propietario').val('');
            else 
                $('#id_telegram_propietario').val(cliente.id_telegram_propietario);
            if (cliente.tipo == 'EMPRESA') {
                $('#panelDatosEstablecimiento').show();
                $('#nombre_establecimiento').val(cliente.nombre_establecimiento);
                $('#nombre_encargado').val(cliente.nombre_encargado);
            } else {
                $('#panelDatosEstablecimiento').hide();
                $('#nombre_establecimiento').val('');
                $('#nombre_encargado').val('');
            }
            $('#usuario').val(cliente.usuario);
            $('#password').val('');
            $('#palabra_secreta').val(cliente.palabra_secreta);
            $('#pregunta_secreta').val(cliente.pregunta_secreta);
            $('#respuesta_pregunta_secreta').val(cliente.respuesta_pregunta_secreta);
            var tmp = '';
            cliente.ruteadores.forEach(function(ruteador) {
                tmp = tmp + `<input class="form-control" placeholder="Ejemplo: WAKM-1212-ABC3" type="text" maxlength="14" value="${ruteador}">`;
            });
            $('#ruteadores').html(tmp);
            $('#enviarDatos').val('Actualizar datos');
            submitHandler = actualizar;
        } else {            
            $('#indicaciones').show();
            $('#apellido_paterno_propietario').change(function() {
                crearNombreUsuario();
            });
            $('#apellido_materno_propietario').change(function() {
                crearNombreUsuario();
            });
            $('#nombre_propietario').change(function() {
                crearNombreUsuario();
            });
            $('#tipo').change(function() {
                var tipo = $("#tipo option:selected").val();
                if (tipo == 'PARTICULAR') {
                    $('#panelDatosEstablecimiento').hide();
                } else if (tipo == 'EMPRESA') {
                    $('#panelDatosEstablecimiento').show();
                }
            });
            $('#usuario').prop('disabled', false);
            $('#panelDatosEstablecimiento').hide();
            $('#password').prop('required', true);

            $('#id_cliente').val('0');
            $('#usuario').val('');
            $('#domicilio').val('');
            $('#colonia').val('');
            $('#delegacion').val('alvaro_obregon');
            $('#telefono').val('');
            $('#telefono_en_domicilio').val('1');
            $('#tipo').val('PARTICULAR');
            $('#apellido_paterno_propietario').val('');
            $('#apellido_materno_propietario').val('');
            $('#nombre_propietario').val('');
            $('#id_telegram_propietario').val('');            
            $('#nombre_establecimiento').val('');
            $('#nombre_encargado').val('');
            $('#usuario').val('');
            $('#password').val('');
            $('#palabra_secreta').val('');
            $('#pregunta_secreta').val('');
            $('#respuesta_pregunta_secreta').val('');
            $('#ruteadores').html('<input class="form-control" placeholder="Ejemplo: WAKM-1212-ABC3" type="text" maxlength="14">');
            $('#enviarDatos').val('Enviar datos');
            submitHandler = crear;
        }

        $('#datosCliente').off().submit(function(e) {
            e.preventDefault();
            submitHandler();    
        });

        $('#agregarRouter').click(function() {
            $('#ruteadores').append('<input class="form-control" placeholder="Ejemplo: WAKM-1212-ABC3" type="text" maxlength="14">');
        });
    });
});