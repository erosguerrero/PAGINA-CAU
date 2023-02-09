"use strict";
class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM aw_tareas_user_tarea " +
                    "JOIN aw_tareas_usuarios as aw ON aw_tareas_user_tarea.idUser = aw.idUser " +
                    "WHERE email = ? AND hecho = true",
                    [email],
                    function (err, rows) {
                        //connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            
                            if (rows[0]) {
                                let i = rows.length;
                                
                                rows.forEach(data => {
                                    connection.query("DELETE FROM aw_tareas_user_tarea WHERE idTarea = ? AND idUser = ?",
                                        [data.idTarea, data.idUser],
                                        function (err, rows) {
                                            //connection.release(); // devolver al pool la conexión
                                            if (err) {
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else {
                                                //Hemos borado la tarea de aw_tareas_user_tareas

                                                connection.query("SELECT COUNT(*) as cont FROM aw_tareas_user_tarea " +
                                                    "WHERE idTarea = ?",
                                                    [data.idTarea],
                                                    function (err, result) {
                                                        //connection.release(); // devolver al pool la conexión
                                                        if (err) {
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                        else {
                                                            if (result[0].cont == 0) {
                                                                connection.query("DELETE FROM aw_tareas_tareas " +
                                                                    "WHERE idTarea = ?",
                                                                    [data.idTarea],
                                                                    function (err, result) {

                                                                        //connection.release(); // devolver al pool la conexión
                                                                        if (err) {
                                                                            callback(new Error("Error de acceso a la base de datos"));
                                                                        }
                                                                        else {
                                                                            connection.query("DELETE FROM aw_tareas_tareas_etiquetas " +
                                                                                "WHERE idTarea = ?",
                                                                                [data.idTarea],
                                                                                function (err, result) {
                                                                                    //connection.release(); // devolver al pool la conexión
                                                                                    if (err) {
                                                                                        callback(new Error("Error de acceso a la base de datos"));
                                                                                    }
                                                                                    else {
                                                                                        i--;
                                                                                        if (i <= 0) {
                                                                                            connection.release();
                                                                                            callback(null,"Última tarea borrada ID: " + data.idTarea);
                                                                                        }
                                                                                        
                                                                                    }
                                                                                });

                                                                        }
                                                                    });
                                                            } else {
                                                               
                                                                            
                                                                i--;
                                                                if (i <= 0) {
                                                                    connection.release();
                                                                    callback(null,"Alguien más está usando la tarea " + data.idTarea+ ", borrada solo para el usuario " +email);
                                                                }
                                                                       
                                                            }

                                                        }
                                                    });

                                            }
                                        });
                                })

                            } else {
                                connection.release();
                                callback(null, "Error al borrar tareas completadas: No hay tareas completadas");
                            }
                        }
                    });
            }
        });
    }

    getAllTasks(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {

                connection.query("SELECT tt.idTarea, tt.texto, ut.hecho, te.texto as tagText " +
                    "FROM aw_tareas_usuarios tu " +
                    "LEFT JOIN aw_tareas_user_tarea as ut ON tu.idUser = ut.idUser " +
                    "LEFT JOIN aw_tareas_tareas as tt ON ut.idTarea = tt.idTarea " +
                    "LEFT JOIN aw_tareas_tareas_etiquetas AS tte ON tte.idTarea = tt.idTarea " +
                    "LEFT JOIN aw_tareas_etiquetas AS te ON te.idEtiqueta = tte.idEtiqueta " +
                    "WHERE tu.email = ? ",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(err);
                        }
                        else {
                            let sett = Array.from(new Set(
                                rows.map(task => task.idTarea))).map(ID => {
                                    return {
                                        id: ID,
                                        text: rows.find(task => task.idTarea === ID).texto,
                                        done: rows.find(task => task.idTarea === ID).hecho,
                                        tags: Array.from(rows.map(function (task) {
                                            if (task.idTarea === ID)
                                                return task.tagText;
                                        })).filter(task => task !== undefined)
                                    }
                                });

                            console.log("Tareas del usuario " + email + " :")
                            if (rows.length === 0) {
                                callback(null, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, sett);
                            }
                        }
                    });
            }
        });
    }

    insertTask(email, task, callback) {
        console.log(task) //Tarea a insertar
        this.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT idUser FROM aw_tareas_usuarios WHERE email = ?",
                    [email],
                    function (err, rows) {
                        if (err) {
                            callback(err, null);
                        } //Error de BBDD al leer el usuario
                        else {
                            if (!rows[0]) {
                                callback(null, null); //Usuario no encontrado
                            }
                            else {//Usuario existe
                                let idU = rows[0].idUser; //Su ID
                                connection.query("INSERT INTO aw_tareas_tareas(texto) VALUES (?)", //Insertamos la tarea con su texto
                                    [task.text],
                                    function (err, rows) {
                                        if (err) { //Falla el acceso a la BBDD
                                            callback(err, null);
                                        }
                                        else {
                                            let idT = rows.insertId; //La id de la tarea
                                            connection.query("INSERT INTO aw_tareas_user_tarea(idUser,idTarea,hecho) VALUES (?,?,?)",
                                                [idU, idT, task.done],//Insertamos en la tabla intermedia de usuarios y tareas
                                                function (err, rows) {
                                                    if (err) {
                                                        callback(err, null); //Error acceso BBDD
                                                    }
                                                    else {
                                                        if(task.tags.length > 0){
                                                        let taskdata = "";
                                                        task.tags.map(t => taskdata += "('" + t + "'),");
                                                        console.log(taskdata)
                                                        connection.query("INSERT IGNORE INTO aw_tareas_etiquetas(texto) VALUES " + taskdata.slice(0, -1),
                                                            function (err, rows) { //Insertamos todos los tags de una sola query
                                                                if (err) {
                                                                    callback(err, null); //Error Acceso BBDD
                                                                }
                                                                else {
                                                                    //Se han insertado los tags, ahora falta añadirlos a la intermedia
                                                                    let i = 1;
                                                                    task.tags.forEach(tag => {
                                                                        connection.query("INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta) " +
                                                                            "SELECT '" + idT + "', ate.idEtiqueta FROM aw_tareas_etiquetas ate " +
                                                                            "WHERE ate.texto = '" + tag + "';",
                                                                            function (err) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    callback(new Error("Error de acceso a la base de datos")); //Error acceso BBDD
                                                                                } else {
                                                                                    i++;
                                                                                    if (i >= task.tags.length) {
                                                                                        connection.release();
                                                                                        callback(null, "Insertada nueva tarea a " + email);
                                                                                    }
                                                                                }
                                                                            });

                                                                    });


                                                                }
                                                            })}else{
                                                                connection.release();
                                                                callback(null, "Insertada nueva tarea sin tags a " + email);
                                                            }
                                                    }
                                                })

                                        }
                                    })
                            }
                        }
                    })
            }
        });
    }

    markTaskDone(idTask, callback) {

        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM aw_tareas_user_tarea  WHERE idTarea = ?",
                    [idTask],
                    function (err, result) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(err);
                        }
                        else {
                            if (result[0]) {
                                connection.query("UPDATE aw_tareas_user_tarea SET hecho = true WHERE idTarea = ?",
                                    [idTask],
                                    function (err) {
                                        connection.release(); // devolver al pool la conexión
                                        if (err) {
                                            callback(err);
                                        }
                                        else {
                                            callback(null, "tarea con id " + idTask + " actualiazada a hecho");
                                        }
                                    });
                            } else {
                                callback(null, null); //no hay tareas con ese id
                            }

                        }
                    });


            }
        });
    }




}



module.exports = DAOTasks;