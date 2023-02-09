"use strict"
/*
● Crear un servidor Express.js
● Crear un pool de conexiones a la base de datos de MySQL.
● Crear una instancia de DAOTasks.
● Arrancar el servidor en el puerto indicado en config.js.
*/

// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const utilidades = new utils();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/*
CREACION DEL MIDDLEWARE ESTÁTICO
ENRUTA Y NOS PERMITE EL ACCESO A LOS FICHEROS ESTÁTICOS
*/
const ficherosEstaticos = path.join(__dirname,"public"); //AÑADE EL PATH AL PROGRAMA
app.use(express.static(ficherosEstaticos)); //CARGA LOS FICHEROS ESTÁTICOS

//manejador para la ruta /tasks
app.get("/tasks",function(request,response){
    
    daoT.getAllTasks("usuario@ucm.es", function(err, result){
        if (err) {
            console.log(err.message);
        }else if(result){
            response.status(200);
            response.render("tasks",{taskList: result})
        }else{
            response.status(200);
            response.render("tasks",{taskList: []})
        }
    });
    
});

//Task form

app.use(bodyParser.urlencoded({extended: false})); //se añade el middleware del bodyparser



app.post("/addTask", function(request, response){

    let taskText = request.body.texto;
    let tarea = utilidades.createTask(taskText)
    
    //Falla si no se le ponen etiquetas en el SQL. 
    daoT.insertTask("usuario@ucm.es",tarea, function(err, result){
        if (err) {
             console.log("--------------ERROR INSERTANDO-----------------");
             console.log(err.message);
        } else if (result) {
            console.log("---------------INSERCCIÓN CORRECTA----------------");
            console.log(result);
            response.status(200);
            response.redirect("/tasks");
        } else {
            console.log("Error de inserción: el usuario no existe");
            console.log("-------------------------------")
        }
    });
    
});

app.post("/deleteTask", function(request, response){
    
    //Falla si no se le ponen etiquetas en el SQL. 
    daoT.deleteCompleted("usuario@ucm.es", function(err, result){
        if (err) {
             console.log("--------------ERROR ELIMINANDO-----------------");
             console.log(err.message);
        } else if (result) {
            console.log("---------------ELIMINACIÓN CORRECTA----------------");
            console.log(result);
            response.status(200);
            response.redirect("/tasks");
        } else {
            console.log("Error de Eliminación: el usuario no existe");
            console.log("-------------------------------")
        }
    });
    
    
});

app.post("/endTask/:taskId", function(request, response){
    let IDtask = request.params.taskId;
    daoT.markTaskDone(IDtask,function(err,result){
        if (err) {
            console.log("--------------ERROR FINALIZANDO TAREA-----------------");
            console.log(err.message);
        } else if(result) {
            console.log("---------------FINALIZACIÓN CORRECTA----------------");
            console.log(result);
            response.status(200);
            response.redirect("/tasks");
        }else{
            console.log("Error al actualiar tarea a hecho: Tarea inexistente");
            console.log("-------------------------------")
        }
    });   

});



// Arrancar el servidor
app.listen(config.port, function(err) {
 if (err) {
 console.log("ERROR al iniciar el servidor");
 }
 else {
 console.log(`Servidor arrancado en el puerto ${config.port}`);
 }
});
