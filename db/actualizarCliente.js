function clienteValido(cliente, callback) {
    if (!('password' in cliente) ||
        !('domicilio' in cliente) ||
        !('colonia' in cliente) ||
        !('delegacion' in cliente) ||
        !('telefono' in cliente) ||
        !('telefono_en_domicilio' in cliente) ||
        !('tipo' in cliente) ||
        !('apellido_paterno_propietario' in cliente) ||
        !('apellido_materno_propietario' in cliente) ||
        !('nombre_propietario' in cliente) ||
        !('id_telegram_propietario' in cliente) ||  
        !('palabra_secreta' in cliente) ||
        !('pregunta_secreta' in cliente) ||
        !('respuesta_pregunta_secreta' in cliente)) {
        callback('Verifique que los datos esten correctos');
        return false;
    } else if (cliente.tipo != 'EMPRESA' && cliente.tipo != 'PARTICULAR') {
        callback('Verifique que los datos esten correctos');
        return false;
    } else if (cliente.tipo == 'EMPRESA' && ( !('nombre_encargado' in cliente) || !('nombre_establecimiento' in cliente) ) ) {
        callback('Verifique que los datos esten correctos');
        return false;
    } else if (!('ruteadores' in cliente) || !Array.isArray(cliente.ruteadores)) { 
        callback('Debe indicar los ruteadores que posee');
        return false;
    } else {
        cliente.ruteadores = cliente.ruteadores.filter(function(ruteador) {
            ruteador = ruteador.trim();
            if (ruteador == '') { 
                return false;
            } else { 
                return true;
            }
        });
        cliente.ruteadores = cliente.ruteadores.reduce(function(acc, ruteador) {
            if (!acc.some(function(elem_on_acc) { return elem_on_acc == ruteador; }))
                acc.push(ruteador);
            return acc;
        }, []);
        if (cliente.ruteadores.length == 0) {
            callback('Debe indicar los ruteadores que posee');
            return false;
        }
    }
    if (cliente.tipo == 'PARTICULAR') {
        cliente.nombre_encargado = null;
        cliente.nombre_establecimiento = null;
    }
    if (cliente.id_telegram_propietario == '') {
        cliente.id_telegram_propietario = 0;
    }
    return true;
}

module.exports = function(pool, config) {
    return function(id_cliente, cliente, callback) {
        if (!clienteValido(cliente, callback)) {
            return;
        }
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log(err);
                callback(config.GENERIC_ERROR);
                return;
            }
            conn.beginTransaction(function(err) {
                if (err) {
                    console.log(err);
                    conn.rollback(function(err) {
                        conn.release();
                        callback(config.GENERIC_ERROR);
                    });
                    return;
                }
                //Los nuevos ruteadores deben existir en el catalogo
                var ruteadores = '';
                cliente.ruteadores = cliente.ruteadores.map(function(ruteador) {
                    return conn.escape(ruteador);
                });
                cliente.ruteadores.forEach(function(ruteador) {
                    if (ruteadores == '') {
                        ruteadores = ruteador
                    } else {
                        ruteadores = ruteadores + ',' + ruteador;
                    }
                });
                conn.query(`
                    SELECT 1
                    FROM ruteadores 
                    WHERE serie_ruteador IN (${ruteadores})`,
                    function(err, rows) {
                        if (err) {
                            console.log(err);
                            conn.release();
                            callback(config.GENERIC_ERROR);
                            return;
                        }
                        if (rows.length != cliente.ruteadores.length) {
                            conn.release();
                            callback('Verifique que esten correctos los numeros de serie introducidos');
                            return;
                        }
                        conn.beginTransaction(function(err) {
                            if (err) {
                                console.log(err);
                                conn.rollback(function(err) {
                                    conn.release();
                                    callback(config.GENERIC_ERROR);
                                });
                                return;
                            }
                            conn.query(`
                                DELETE FROM ruteadores_cliente
                                WHERE id_cliente = ${id_cliente}`,
                                function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        conn.rollback(function(err) {
                                            conn.release();
                                            callback(config.GENERIC_ERROR);
                                        });
                                        return;
                                    }
                                    conn.query(`
                                        SELECT 1
                                        FROM ruteadores_cliente
                                        WHERE serie_ruteador IN (${ruteadores})`,
                                        function(err, rows) {
                                            if (err) {
                                                console.log(err);
                                                conn.rollback(function(err) {
                                                    conn.release();
                                                    callback(config.GENERIC_ERROR);
                                                });
                                                return;
                                            }
                                            if (rows.length != 0) {
                                                conn.rollback(function(err) {
                                                    conn.release();
                                                    callback('Los ruteadores indicados ya estan siendo utilizados por otro cliente, verifique');
                                                });
                                                return;
                                            }
                                            var tmp = '';
                                            cliente.ruteadores.forEach(function(ruteador) {
                                                if (tmp == '') {
                                                    tmp = `(${id_cliente}, ${ruteador})`;
                                                } else {
                                                    tmp = tmp + `,(${id_cliente}, ${ruteador})`;
                                                }
                                            });
                                            conn.query(
                                                `INSERT INTO ruteadores_cliente (id_cliente, serie_ruteador) 
                                                VALUES ${tmp}`,
                                                function(err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        conn.rollback(function(err) {
                                                            conn.release();
                                                            callback(config.GENERIC_ERROR);
                                                        });
                                                        return;
                                                    }
                                                    var query = '';
                                                    if (cliente.password.trim() != '') {
                                                        query = 'password = '+conn.escape(cliente.password.trim())+',';
                                                    }
                                                    if (cliente.tipo == 'EMPRESA') {
                                                        query = query +
                                                            'nombre_establecimiento = '+conn.escape(cliente.nombre_establecimiento)+','+
                                                            'nombre_encargado = '+conn.escape(cliente.nombre_encargado)+',';
                                                    }
                                                    conn.query(
                                                        'UPDATE clientes SET '+query+`
                                                        domicilio = ?,
                                                        colonia = ?,
                                                        delegacion = ?,
                                                        telefono = ?,
                                                        telefono_en_domicilio = ?,
                                                        tipo = ?,
                                                        apellido_paterno_propietario = ?,
                                                        apellido_materno_propietario = ?,
                                                        nombre_propietario = ?,
                                                        id_telegram_propietario = ?,            
                                                        palabra_secreta = ?,
                                                        pregunta_secreta = ?,
                                                        respuesta_pregunta_secreta = ?
                                                        WHERE id_cliente = ${id_cliente}
                                                        `,[
                                                            cliente.domicilio,
                                                            cliente.colonia,
                                                            cliente.delegacion,
                                                            cliente.telefono,
                                                            cliente.telefono_en_domicilio,
                                                            cliente.tipo,
                                                            cliente.apellido_paterno_propietario,
                                                            cliente.apellido_materno_propietario,
                                                            cliente.nombre_propietario,
                                                            cliente.id_telegram_propietario,
                                                            cliente.palabra_secreta,
                                                            cliente.pregunta_secreta,
                                                            cliente.respuesta_pregunta_secreta
                                                        ],
                                                        function(err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                conn.rollback(function(err) {
                                                                    conn.release();
                                                                    callback(config.GENERIC_ERROR);
                                                                });
                                                            }
                                                            conn.commit(function(err) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    conn.rollback(function(err) {
                                                                        conn.release();
                                                                        callback(config.GENERIC_ERROR);
                                                                    });
                                                                    return;
                                                                }
                                                                conn.release();
                                                                callback(false);
                                                            });
                                                        } 
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });
        });
    };
};