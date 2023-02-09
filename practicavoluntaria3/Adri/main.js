"use strict";
const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUsers");
const DAOTasks = require("./DAOTasks");

// Crear el pool de conexiones

const pool = mysql.createPool({
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.database
});

//Callback DAOUsers

function cb_isUserCorrect(err, result){
	if (err) {
		console.log(err.message);
	} else if (result) {
		console.log("Usuario y contraseña correctos");
	} else {
		console.log("Usuario y/o contraseña incorrectos");
	}
}

function cb_getUserImageName(err, result){
	if (err) {
		console.log(err.message);
	} else if (result !== undefined) {
		if(result === null)
			console.log("El usuario no dispone de imagen");
		else
			console.log(result);
	} else {
		console.log("Usuario y/o contraseña incorrectos");
	}
}

//Callback DAOTasks

function cb_getAllTasks(err, tareas){
	if (err) {
		console.log(err.message);
	} else {
		console.log(tareas);
	}
}

function cb_insertTask(err){
	if (err) {
		console.log(err.message);
	} else {
		console.log("Tarea insertada correctamente");
	}
}

function cb_insertTag(err){
	if (err) {
		console.log(err.message);
	} else {
		console.log("Tag insertada correctamente");
	}
}

function cb_markTaskDone(err){
	if (err) {
		console.log(err.message);
	} else {
		console.log("Tarea modificada correctamente");
	}
}

function cb_deleteCompleted(err){
	if (err) {
		console.log(err.message);
	} else {
		console.log("Tareas eliminadas correctamente");
	}
}


//Resto

let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);

//daoUser.isUserCorrect("u1@ucm.es", "mypass", cb_isUserCorrect);
//daoUser.getUserImageName("u1@ucm.es",cb_getUserImageName);

//daoTask.getAllTasks("u1@ucm.es",cb_getAllTasks);
//daoTask.insertTask("u1@ucm.es", {text: "PruebaTask", done:0, tags: ["Hola", "Tareas"]}, cb_insertTask);
//daoTask.markTaskDone(1, cb_markTaskDone);
daoTask.deleteCompleted("u1@ucm.es", cb_deleteCompleted);