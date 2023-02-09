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

let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);


// Definición de las funciones callback
// Uso de los métodos de las clases DAOUsers y DAOTasks

/*
DAO USERS isUserCorrect
Comprueba si el usuario introducido y su contraseña son correctos
-------------------------------------------------
*/

function cb_isUserCorrect(err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log("Usuario y contraseña correctos");
        console.log("-------------------------------")
    } else {
        console.log("Usuario y/o contraseña incorrectos");
        console.log("-------------------------------")
    }
}

//PRUEBA 1: usuario con contraseña incorrecta
daoUser.isUserCorrect("bill.puertas@ucm.es", "contraseñaInvalida", cb_isUserCorrect);
//PRUEBA 2: usuario con contraseña correcta
daoUser.isUserCorrect("steve.curros@ucm.es", "steve", cb_isUserCorrect);

/*
DAO USERS getUserImageName
Comprueba si el usuario tiene imagen
-------------------------------------------------
*/
function cb_getUserImageName(err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log("El usuario tiene imagen");
        console.log("-------------------------------")
    } else {
        console.log("El usuario no tiene imagen");
        console.log("-------------------------------")
    }
}

//PRUEBA 3: el usuario tiene imagen

daoUser.getUserImageName("steve.curros@ucm.es", cb_getUserImageName);

/*
DAO TASKS getAllTasks
imprime todas las tareas de una persona
-------------------------------------------------
*/
function cb_getAllTasks(err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log(result);
        console.log("-------------------------------")
    } else {
        console.log("Sin datos");
        console.log("-------------------------------")
    }
}
//PRUEBA 4: usuario sin tareas 
//daoTask.getAllTasks("usuarioInventado", cb_getAllTasks);
//PRUEBA 5: usuario con 3 tareas
//daoTask.getAllTasks("felipe.lotas@ucm.es", cb_getAllTasks);

/*
DAO TASKS insertTask
inserta una tarea
-------------------------------------------------
*/
function cb_insert(err, result) {
    if (err) {
        console.log(err.message);
        console.log("-------------------------------")
    } else if (result) {
        console.log(result);
        console.log("-------------------------------")
    } else {
        console.log("Error de inserción: el usuario no existe");
        console.log("-------------------------------")
    }
}

//PRUEBA 6: insertamos una tarea a aitor.tilla
daoTask.insertTask("aitor.tilla@ucm.es",{"text": "Mesa1", "done" : false, "tags" : ["AW", "asd"]}, cb_insert);
//PRUEBA 7: usuario inexistente para que no se inserte
daoTask.insertTask("usuarioInventado",{"text": "Tarea nueva", "done" : false, "tags" : ["AW", "asd"]}, cb_insert);

/*
DAO TASKS markTaskDone
marca una tarea a hecho
-------------------------------------------------
*/
function cb_markTaskDone(err, result) {
    
    if (err) {
        console.log(err.message);
        console.log("-------------------------------")
    } else if(result) {
        console.log(result);
        console.log("-------------------------------")
    }else{
        console.log("Error al actualiar tarea a hecho: Tarea inexistente");
        console.log("-------------------------------")
    }
}
//PRUEBA 8: tarea 5 a hecho
//daoTask.markTaskDone(5, cb_markTaskDone);
//PRUEBA 9: tarea inexistente a hecho
//daoTask.markTaskDone(100, cb_markTaskDone);

/*
DAO TASKS deleteCompleted
eliminar tareas pasando email
-------------------------------------------------
*/
function cb_deleteCompleted(err, result) {
    
    if (err) {
        console.log(err.message);
        console.log("-------------------------------")
    } else  {
        console.log( result );
        console.log("-------------------------------")
    } 
}
//PRUEBA 10: borrar las tareas que tenga aitor completadas y si solo las tiene él las borra completamente
//si no, solo le borra la tarea a aitor
//daoTask.deleteCompleted("aitor.tilla@ucm.es", cb_deleteCompleted);
