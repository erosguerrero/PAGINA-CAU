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
const session = require("express-session");
const express = require("express");
const bodyParser = require("body-parser");
const mysqlSession = require("express-mysql-session");
//Obtener la clase MySqlStore
const mySQLStore = mysqlSession(session);
const sessionStore = new mySQLStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "tareas"
})

const fs = require("fs");
const DAOUsers = require("./DAOUsers");
const MySQLStore = require("express-mysql-session");
const { response } = require("express");
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const daoU = new DAOUsers(pool);
const utilidades = new utils();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
/*
CREACION DEL MIDDLEWARE ESTÁTICO
ENRUTA Y NOS PERMITE EL ACCESO A LOS FICHEROS ESTÁTICOS
*/
const ficherosEstaticos = path.join(__dirname,"public"); //AÑADE EL PATH AL PROGRAMA
app.use(express.static(ficherosEstaticos)); //CARGA LOS FICHEROS ESTÁTICOS

//Middleware de las Sesiones. El objeto sessionStore creado puede pasarse a la función session como parámetro
const middlewareSession = session({
    secret: "miclavesecreta",
    resave: false,
    saveUninitialized: false,
    store:sessionStore//ahora session se guarda en la BBDD
});

app.use(middlewareSession);

function flashMiddleware (request, response, next){
    response.setFlash = function(msg){
        request.session.flashMsg = msg;
    };
    
    response.locals.getAndClearFlash=function(){
        
        let msg = request.session.flashMsg;
        delete request.session.flashMsg;
        return msg;
    };
    next()
}
app.use(flashMiddleware);

app.use(bodyParser.urlencoded({extended: false})); //se añade el middleware del bodyparser
//manejador para la ruta /login
app.get("/login", function(request,response){
    response.status(200);
    response.render("login")
});

app.post("/login", function(request, response){
    let email = request.body.email;
    let passw = request.body.password;
    //Falla si no se le ponen etiquetas en el SQL. 
    daoU.isUserCorrect(email, passw, function(err, result){
        if (err) {
             console.log("--------------ERROR LOGIN-----------------");
             response.status(500);
             response.render("login", {errorMsg: "Error interno de acceso a la base de datos"});
             console.log(err.message);
        } else if (result) {
            console.log("---------------LOGIN CORRECTO----------------");
            console.log("USUARIO"+ result);
            request.session.currentUser = email;
           
            //response.locals.userEmail = email;
            //TODO hay que hacerlo usando response.locals.userEmail
            response.redirect("/tasks");
        } else {
            response.status(200);
            //response.render("login", {errorMsg:"Dirección de correo y/o contraseña no válidos."});
            response.setFlash("Dirección de correo y/o contraseña no válidos.");
            response.redirect("/login");
        }
    });
     
});

function middlewareAccess (request, response, next){
    if (request.session.currentUser === undefined){
        //console.log(request.session.currentUser);
        response.redirect("/login");
    }else {
        response.locals.userEmail = request.session.currentUser;
        next();
    }
}
app.use(middlewareAccess);


/*function middlewarePrueba (request, response, next){
    console.log("ENTRA AL MIDLEWARE");
    next();
}*/



//manejador para la ruta /tasks
app.get("/tasks",middlewareAccess,function(request,response){
    let email = request.body.email;
    let correoUsuario = request.session.currentUser;
    daoT.getAllTasks(correoUsuario, function(err, result){
        if (err) {
            console.log(err.message);
        }else if(result){
            response.status(200);
            response.render("tasks",{taskList: result, respuesta: response.locals})
        }else{
            response.status(200);
            response.render("tasks",{taskList: []})
        }
    });
    
});

//manejador para la ruta /tasks
app.get("/imagenUsuario",middlewareAccess,function(request,response){
    let email = request.body.email;
    let correoUsuario = request.session.currentUser;
    daoU.getUserImageName (correoUsuario, function(err, result){
        if (err) {
            console.log(err.message);
        }else if(result){
            console.log("IMAGEN" + JSON.stringify(result.img))
            response.sendFile(__dirname+"/public/img/profile_imgs/"+result.img);
            //response.redirect("/tasks");
        }else{
            response.sendFile(__dirname+"/public/img/"+ "noUser.png")
            //response.redirect("/tasks")
        }
    });
    
});

//manejador para la ruta /logout
app.get("/logout",middlewareAccess, function(request,response){
    request.session.destroy();
    response.status(200);
    response.redirect("/login")
});




//Task form
app.post("/addTask",middlewareAccess, function(request, response){

    let taskText = request.body.texto;

    let tarea = utilidades.createTask(taskText)
    console.log("TAREA" + tarea);
    let correoUsuario = request.session.currentUser;
    //Falla si no se le ponen etiquetas en el SQL. 
    daoT.insertTask(correoUsuario,tarea, function(err, result){
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

app.post("/deleteTask", middlewareAccess,function(request, response){
    let correoUsuario = request.session.currentUser;
    //Falla si no se le ponen etiquetas en el SQL. 
    daoT.deleteCompleted(correoUsuario, function(err, result){
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





app.post("/endTask/:taskId",middlewareAccess, function(request, response){
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


//manejador para la ruta /login
app.get("/", function(request,response){
    response.status(200);
    response.render("login")
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
