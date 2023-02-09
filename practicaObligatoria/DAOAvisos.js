"use strict";
class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }
    getHistoricoUser(idUser,callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT idAviso, categoria, tipo, awa.fecha,user, texto, comentarios, awu.nombre as nombreUser, awu.perfil as perfilUser" +
                " FROM ucm_aw_cau_avi_avisos as awa JOIN ucm_aw_cau_usu_usuarios as awu ON awu.idUser= awa.user" +
                " WHERE awa.user = ? and awa.activo=0 ",
                [idUser],
                function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getHistoricoTecnico(idUser,callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT idAviso, categoria, tipo, awa.fecha,user, texto, comentarios, awu.nombre as nombreUser, awu.perfil as perfilUser" +
                " FROM ucm_aw_cau_avi_avisos as awa JOIN ucm_aw_cau_usu_usuarios as awu ON awu.idUser= awa.user" +
                " WHERE awa.tecnico = ? and awa.activo=0 ",
                [idUser],
                function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getAllAvisos(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT idAviso, categoria, tipo, awa.fecha, awu.nombre as nombreTecnico, awu.idUser as idTecnico, texto, comentarios, awuu.nombre as nombreUser " +
                    "FROM ucm_aw_cau_avi_avisos as awa " +
                    "LEFT JOIN ucm_aw_cau_usu_usuarios as awu ON awu.idUser = awa.tecnico " +
                    "LEFT JOIN ucm_aw_cau_usu_usuarios as awuu ON awuu.idUser = awa.user WHERE awa.activo=1 ",
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getAllAvisosUser(idUser, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT idAviso, categoria, tipo, awa.fecha, awu.nombre as tecnico, texto, comentarios " +
                    "FROM ucm_aw_cau_avi_avisos as awa " +
                    "LEFT JOIN ucm_aw_cau_usu_usuarios as awu ON awu.idUser = awa.tecnico " +
                    "WHERE user = ? ",
                    [idUser],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getAllAvisosTecnico(idUser, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT idAviso, categoria, tipo, awa.fecha,user, texto, comentarios, awu.nombre as nombreUser, awu.perfil as perfilUser" +
                    " FROM ucm_aw_cau_avi_avisos as awa JOIN ucm_aw_cau_usu_usuarios as awu ON awu.idUser= awa.user" +
                    " WHERE awa.tecnico = ? and awa.activo=1 ",
                    [idUser],

                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    insertAviso(user, texto, fecha, categoria, tipo, comentarios, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                callback(new Error("Error de conexión a la base de datos"));

            } else {//Usuario existe
                connection.query("INSERT INTO ucm_aw_cau_avi_avisos(user,texto,fecha,categoria,tipo,comentarios,activo) VALUES (?,?,?,?,?,?,1)", //Insertamos la tarea con su texto
                    [user, texto, fecha, categoria, tipo, comentarios],
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

    asignarTecnico(tecnico, aviso, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                callback(new Error("Error de conexión a la base de datos"));

            } else {//Usuario existe
                connection.query("UPDATE ucm_aw_cau_avi_avisos SET tecnico=? WHERE idAviso=?", //Insertamos la tarea con su texto
                    [tecnico, aviso],
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
    getCountAvisos(idUser, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT IFNULL(SUM(IF(categoria = 'I', 1, 0)), 0)  AS I, IFNULL(SUM(IF(categoria = 'S', 1, 0)), 0) AS S,IFNULL(SUM(IF(categoria = 'F', 1, 0)), 0)  AS F" +
                    " FROM ucm_aw_cau_avi_avisos " +
                    " WHERE user = ?",
                    [idUser],

                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    eliminarAviso(tecnico, aviso,comentario, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                callback(new Error("Error de conexión a la base de datos"));

            } else {//Usuario existe
                
                connection.query("UPDATE ucm_aw_cau_avi_avisos SET activo=0, tecnico=?, comentarios=? WHERE idAviso=?", //Insertamos la tarea con su texto
                    [tecnico,comentario, aviso],
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



}



module.exports = DAOTasks;