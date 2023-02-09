"use strict";	
const pool = {
 host: "localhost",// Ordenador que ejecuta el SGBD
 user: "root", // Usuario que accede a la BD
 password: "", // Contraseña con la que se accede a la BD
 database: "aw_tareas" // Nombre de la base de datos
}

class DAOTasks {
	constructor(pool) {
		this._pool = pool;
	}
	
	getAllTasks(email, callback) {
		this._pool.getConnection(function(err, connection) {
			if (err) {
				connection.release();
				callback(new Error("Error de conexión a la base de datos"));
			}
			else {
				connection.query("SELECT t.id, t.text, ut.done, tg.tag " +
								 "FROM usuario u JOIN usuariotask ut ON (u.id = ut.usuarioID) JOIN task t ON (ut.taskID = t.id) JOIN tasktag ttg ON (t.id = ttg.taskID) JOIN tag tg ON (tg.id = ttg.tagID) " +
								 "WHERE u.email = ? ORDER BY t.id" , [email], 
					function(err, rows) {
						connection.release(); // devolver al pool la conexión
						if (err) {
							callback(new Error("Error de acceso a la base de datos"));
						}
						else {
							//Cada tarea es de la forma	 { id: "", text:"", done:"",tags:{ } }
							let tareasDistintas = Array.from(new Set(
							rows.map(t => t.id))).map(id => {
								return {
									id: id, 
									text: rows.find(t => t.id === id).text,
									done: rows.find(t => t.id === id).done,
									tags: Array.from(rows.map(function(t){
												if(t.id === id)
													return t.tag;
											})).filter(t => t!==undefined)
								}
							});
							callback(null, tareasDistintas);
						}
					}
				);
			}
		});
	}
	
	insertTask(email, task, callback) {
		this._pool.getConnection(function(err, connection) {
			if (err) {
				connection.release();
				callback(new Error("Error de conexión a la base de datos 1"));
			}
			else {
				connection.query("INSERT INTO task(text) VALUES (?)" , [task.text], 
					function(err, result) {
						if (err) {
							connection.release();
							callback(new Error("Error de acceso a la base de datos 2"));
						}
						else {
							let idTask = result.insertId;
							connection.query("SELECT id FROM usuario WHERE email = ?", [email],
							function(err,result){
								connection.query("INSERT INTO usuariotask(usuarioID, taskID) VALUES (?, ?)" , [result[0].id, idTask],
								function(err) {
									if (err) {
										connection.release();
										callback(new Error("Error de acceso a la base de datos 3"));
									}
									else{
										let tgs = task.tags.map(tg => [ tg ]);
										let i = 0;
										tgs.forEach(tg => connection.query("SELECT id FROM tag WHERE tag = ?" , [tg], 
											function(err, result) {
												i++;
												if (err) {
													console.log(err);
													callback(new Error("Error de acceso a la base de datos 4"));
												}
												else{
													if(result.length === 0){
														connection.query("INSERT INTO tag (tag) VALUES (?)" , [tg], 
														function(err, result) {
															if (err) {
																callback(new Error("Error de acceso a la base de datos 4"));
															}
															else {
																let idTag = result.insertId;
																connection.query("INSERT INTO tasktag (taskID, tagID) VALUES (?, ?)" , [idTask, idTag], 
																function(err, rows) {
																	if (err) {
																		connection.release();
																		callback(new Error("Error de acceso a la base de datos 5"));
																	}
																});
															}
														})
													}
													else{
														let idTag = result[0].id;
														connection.query("INSERT INTO tasktag (taskID, tagID) VALUES (?, ?)" , [idTask, idTag], 
														function(err, rows) {
															if (err) {
																connection.release();
																callback(new Error("Error de acceso a la base de datos 5"));
															}
														});
													}
													
													if(i === tgs.length){
														connection.release();
														callback(null);
													}
												}
											})
										);
										/*
										
										*/
									}
								});
							});
						}
					}
				);
			}
		});
	}
	
	markTaskDone(idTask, callback) {
		this._pool.getConnection(function(err, connection) {
			if (err) {
				connection.release();
				callback(new Error("Error de conexión a la base de datos"));
			}
			else {
				connection.query("UPDATE usuariotask SET done = 1 WHERE taskID = ?" , [idTask], 
					function(err, rows) {
						connection.release(); // devolver al pool la conexión
						if (err) {
							callback(new Error("Error de acceso a la base de datos"));
						}
						else {
							callback(null);
						}
					}
				);
			}
		});
	}
	
	deleteCompleted(email, callback) {
		this._pool.getConnection(function(err, connection) {
			if (err) {
				connection.release();
				callback(new Error("Error de conexión a la base de datos"));
			}
			else {
				//TODO terminar
				connection.query("UPDATE task t left join usuariotask ut ON (ut.taskID = t.id)"
								+ "left join usuario u ON (u.id = ut.usuarioID)"
								+ "SET t.activo = 0 "
								+ "WHERE u.email = ? and ut.done = 1" , [email], 
					function(err, rows) {
						connection.release(); // devolver al pool la conexión
						if (err) {
							callback(new Error("Error de acceso a la base de datos"));
						}
						else {
							callback(null);
						}
					}
				);
			}
		});
	}
}
module.exports = DAOTasks;