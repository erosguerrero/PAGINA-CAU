"use strict";
class DAOUsers {

    constructor(pool) {
        this.pool = pool;
    }

    eliminarUsuario(idUser, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("UPDATE UCM_AW_CAU_USU_Usuarios SET activo=0 WHERE idUser = ?",
                    [idUser],
                    function (err, rows) {
                        if (err) { //Falla el acceso a la BBDD
                            callback(err, null);
                        }
                        else {
                            callback(null, true);
                        }

                    });
            }
        });
    }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE email = ? AND password = ? AND activo = 1",
                    [email, password],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, true);
                            }
                        }
                    });
            }
        });
    }

    insertUser(usuario, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT COUNT(*) as cont FROM UCM_AW_CAU_USU_Usuarios WHERE email = ?",
                    [usuario.email],
                    function (err, result) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(err);
                        }
                        else {
                            if(result[0].cont == 0){
                            connection.query("INSERT INTO UCM_AW_CAU_USU_Usuarios (email, password, nombre, perfil, tecnico, nEmpleado,fecha,hora, img) "+
                            "VALUES(?, ?, ?, ?, ?, ?,?,?, ?)",
                                [usuario.email, usuario.passw, usuario.nombre, usuario.perfil, usuario.tecnico, usuario.nEmpleado,usuario.fecha,usuario.hora, usuario.imagen],
                                function (err, rows) {
                                    connection.release(); // devolver al pool la conexión
                                    if (err) {
                                        callback(err);
                                    }
                                    else {
                                       /* if (rows.length === 0) {
                                            callback(null, false); //no está el usuario con el password proporcionado
                                        }
                                        else {*/
                                        callback(null, true);
                                        //}
                                    }
                                });
                            }else{
                                callback(null,false);
                            }
                        }
                    });



                
            }
        }
        );
    }

    getUserImageName(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT img FROM UCM_AW_CAU_USU_Usuarios WHERE email = ? ",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows[0].img==null) {
                                callback(null, null); //el usuario no tiene imagen
                            }
                            else {
                                callback(null, rows[0].img);
                            }
                        }
                    });
            }
        });
    }

    getUsuarios(idUser,callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE activo = 1 AND NOT idUser = ? ",
                [idUser],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows.length === 0) {
                                callback(null, null); //no hay tecnicos
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getAllTecnicos( callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE tecnico = 1 ",
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows.length === 0) {
                                callback(null, null); //no hay tecnicos
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getUser(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE email = ? ",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows[0]) {
                                callback(null, rows[0]);

                            }
                            else {
                                callback(null, null); //el usuario no tiene imagen
                            }
                        }
                    });
            }
        });
    }

    nEmpleadoUnico(nEmpleado, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE nEmpleado = ? ",
                    [nEmpleado],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows[0]) {
                                callback(null, false);

                            }
                            else {
                                callback(null, true); //el usuario no tiene imagen
                            }
                        }
                    });
            }
        });
    }

    getUserById(id, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE idUser = ? ",
                    [id],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {                           
                            if (rows[0]) {
                                callback(null, rows[0]);

                            }
                            else {
                                callback(null, null); //el usuario no tiene imagen
                            }
                        }
                    });
            }
        });
    }
}

module.exports = DAOUsers;
