module.exports = function(pool, config) {
    return function(id_cliente, callback) {
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log(err);
                callback(config.GENERIC_ERROR);
                return;
            }
            conn.query(`
                SELECT
                    id_cliente,
                    usuario,
                    domicilio,
                    colonia,
                    delegacion,
                    telefono,
                    telefono_en_domicilio,
                    tipo,
                    apellido_paterno_propietario,
                    apellido_materno_propietario,
                    nombre_propietario,
                    id_telegram_propietario,
                    nombre_establecimiento,
                    nombre_encargado,
                    palabra_secreta,
                    pregunta_secreta,
                    respuesta_pregunta_secreta
                FROM clientes
                WHERE id_cliente = ?
                LIMIT 1`, [id_cliente],
                function(err, rows) {
                    if (err) {
                        conn.release();
                        console.log(err);
                        callback(config.GENERIC_ERROR);
                        return;
                    }
                    if (rows.length == 0) {
                        conn.release();
                        callback(`No se ha encontrado al cliente con identificador ${id_cliente}`);
                        return;
                    }
                    var row = rows[0];
                    var cliente = {
                        id_cliente: row.id_cliente,
                        usuario: row.usuario,
                        domicilio: row.domicilio,
                        colonia: row.colonia,
                        delegacion: row.delegacion,
                        telefono: row.telefono,
                        telefono_en_domicilio: row.telefono_en_domicilio,
                        tipo: row.tipo,
                        apellido_paterno_propietario: row.apellido_paterno_propietario,
                        apellido_materno_propietario: row.apellido_materno_propietario,
                        nombre_propietario: row.nombre_propietario,
                        id_telegram_propietario: row.id_telegram_propietario,
                        nombre_establecimiento: row.nombre_establecimiento,
                        nombre_encargado: row.nombre_encargado,
                        palabra_secreta: row.palabra_secreta,
                        pregunta_secreta: row.pregunta_secreta,
                        respuesta_pregunta_secreta: row.respuesta_pregunta_secreta,
                    };
                    conn.query(`
                        SELECT serie_ruteador
                        FROM ruteadores_cliente
                        WHERE id_cliente = ?
                        `,[cliente.id_cliente], 
                        function(err, rows) {
                            conn.release();
                            if (err) {
                                console.log(err);
                                callback(config.GENERIC_ERROR);
                                return;
                            }
                            cliente.ruteadores = [];
                            rows.forEach(function(row) {
                                cliente.ruteadores.push(row['serie_ruteador']);
                            });
                            callback(false, cliente);
                        }
                    );
                }
            );
        });
    }
}
