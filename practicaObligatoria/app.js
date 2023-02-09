"use strict"


const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const session = require("express-session");
const express = require("express");
let moment = require("moment"); //manejo de fechas
//const bodyParser = require("body-parser");
const multer = require("multer");
const mysqlSession = require("express-mysql-session");
const { check, validationResult } = require('express-validator'); //info en diapo 121 express avanzado y githubs de las diapos
//Obtener la clase MySqlStore
const mySQLStore = mysqlSession(session);
const sessionStore = new mySQLStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "UCM_CAU"
})

const fs = require("fs");
const DAOUsers = require("./DAOUsers");
const DAOAvisos = require("./DAOAvisos");
const MySQLStore = require("express-mysql-session");
const { response } = require("express");
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
// Crear una instancia de DAOTasks
const daoU = new DAOUsers(pool);
const daoA = new DAOAvisos(pool);

//Multer
const multerFactory = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
/*
CREACION DEL MIDDLEWARE ESTÁTICO
ENRUTA Y NOS PERMITE EL ACCESO A LOS FICHEROS ESTÁTICOS
*/
const ficherosEstaticos = path.join(__dirname, "public"); //AÑADE EL PATH AL PROGRAMA
app.use(express.static(ficherosEstaticos)); //CARGA LOS FICHEROS ESTÁTICOS



//Middleware de las Sesiones. El objeto sessionStore creado puede pasarse a la función session como parámetro
const middlewareSession = session({
    secret: "miclavesecreta",
    resave: false,
    saveUninitialized: false,
    store: sessionStore//ahora session se guarda en la BBDD
});

app.use(middlewareSession);

function flashMiddleware(request, response, next) {
    response.setFlash = function (msg) {
        request.session.flashMsg = msg;
    };

    response.locals.getAndClearFlash = function () {

        let msg = request.session.flashMsg;
        delete request.session.flashMsg;
        return msg;
    };
    next()
}
app.use(flashMiddleware);

//app.use(bodyParser.urlencoded({extended: false})); //se añade el middleware del bodyparser
app.use(express.urlencoded({ extended: true })); //Diapo 90 express avanzado
//OJO!! poner los get antes que los post!
//manejador para la ruta /login
app.get("/login", function (request, response) {
    response.status(200);
    response.render("login")
});

app.get("/entrantes", middlewareAccess, function (request, response) {
    response.status(200);

    if (request.session.currentUserTecnico == '1') { //es usuario

        daoA.getAllAvisos(function (err, result) {
            if (err) {
                console.log(err.message);
            } else {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            daoU.getAllTecnicos(function (err2, result2) {
                                if (err2) {
                                    console.log(err2.message);
                                } else {
                                    response.locals.counts = result3;
                                    if (result) {
                                        response.status(200);

                                        response.render("entrantes", { respuesta: response.locals, avisosList: result, tecnicosList: result2 })
                                    } else {
                                        response.status(200);
                                        response.render("entrantes", { respuesta: response.locals, avisosList: [], tecnicosList: result2 })
                                    }
                                }
                            });
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("entrantes", { respuesta: response.locals, avisosList: [], tecnicosList: result2 })
                        }
                    }
                });

            }
        });
    }
});

app.get("/index", middlewareAccess, function (request, response) {
    response.status(200);
    if (request.session.currentUserTecnico == '0') { //es usuario
        daoA.getAllAvisosUser(request.session.currentUserId, function (err, result) {
            if (err) {
                console.log(err.message);
            } else if (result) {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: result, historico: '0' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '0' })
                        }
                    }
                });

            } else {
                response.status(200);
                response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                response.render("index", { respuesta: response.locals, avisosList: [], historico: '0' })
            }
        });
    } else {

        daoA.getAllAvisosTecnico(request.session.currentUserId, function (err, result) {
            if (err) {
                console.log(err.message);
            } else if (result) {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: result, historico: '0' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '0' })
                        }
                    }
                });
            } else {
                response.status(200);
                response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                response.render("index", { respuesta: response.locals, avisosList: [], historico: '0' })
            }
        });
    }

});

app.get("/historico", middlewareAccess, function (request, response) {
    response.status(200);
    if (request.session.currentUserTecnico == '0') { //es usuario
        daoA.getHistoricoUser(request.session.currentUserId, function (err, result) {
            if (err) {
                console.log(err.message);
            } else if (result) {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: result, historico: '1' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        }
                    }
                });
            } else {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        }
                    }
                });
            }
        });
    } else {
        daoA.getHistoricoTecnico(request.session.currentUserId, function (err, result) {
            if (err) {
                console.log(err.message);
            } else if (result) {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: result, historico: '1' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        }
                    }
                });
            } else {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("index", { respuesta: response.locals, avisosList: [], historico: '1' })
                        }
                    }
                });
            }
        });
    }
});

app.get("/usuarios", middlewareAccess, function (request, response) {
    response.status(200);
    if (request.session.currentUserTecnico == '1') { //es tecnico

        daoU.getUsuarios(request.session.currentUserId, function (err, result) {
            if (err) {
                console.log(err.message);
            } else if (result) {
                daoA.getCountAvisos(request.session.currentUserId, function (err3, result3) {
                    if (err3) {
                        console.log(err3.message);
                    } else {
                        if (result3) {
                            response.status(200);
                            response.locals.counts = result3;
                            response.render("usuarios", { respuesta: response.locals, usuariosList: result })
                        } else {
                            response.status(200);
                            response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                            response.render("usuarios", { respuesta: response.locals, usuariosList: [] })
                        }
                    }
                });
            } else {
                response.status(200);
                response.locals.counts = [{ "I": 0, "S": 0, "F": 0 }];
                response.render("usuarios", { respuesta: response.locals, usuariosList: [] })
            }
        });
    }
});


//OJO!! poner los get antes que los post!
app.get("/register", function (request, response) {
    response.status(200);
    response.render("register");
});


app.post("/login", function (request, response) {
    let email = request.body.email;
    let passw = request.body.password;
    //Falla si no se le ponen etiquetas en el SQL. 
    daoU.isUserCorrect(email, passw, function (err, result) {
        if (err) {
            console.log("--------------ERROR LOGIN-----------------");
            response.status(500);
            response.setFlash("Error interno de acceso a la base de datos");
            response.render("login");
            console.log(err.message);
        } else if (result) {
            console.log("---------------LOGIN CORRECTO----------------");
            console.log("USUARIO" + result);
            request.session.currentUser = email;
            //NO COGE EL NOMBRE Y ESO
            daoU.getUser(email, function (err, result) {
                if (err) {
                    console.log("--------------ERROR LOGIN-----------------");
                    response.status(500);
                    response.setFlash("Error interno de acceso a la base de datos");
                    response.render("login");
                } else if (result) {
                    console.log("---------------LOGIN CORRECTO----------------");
                    //NO COGE EL NOMBRE Y ESO
                    request.session.currentUserName = result.nombre;
                    request.session.currentUserProfile = result.perfil;
                    request.session.currentUserId = result.idUser;
                    request.session.currentUserTecnico = result.tecnico;
                    request.session.currentUserFecha = result.fecha;
                    request.session.currentUserHora = result.hora;
                    request.session.currentUserPassword = result.password.length;
                    response.redirect("/index");
                } else {
                    response.status(200);
                    response.setFlash("Dirección de correo y/o contraseña no válidos.");
                    response.redirect("/login");
                }
            });
        } else {
            response.status(200);
            response.setFlash("Dirección de correo y/o contraseña no válidos.");
            response.redirect("/login");
        }
    });

});


function registrarUser(usuario, response, request){
      //Falla si no se le ponen etiquetas en el SQL. 
      daoU.insertUser(usuario, function (err, result) {
        if (err) {
            console.log("--------------ERROR REGISTER-----------------");
            response.status(500);
            response.setFlash("Error interno de acceso a la base de datos");
            response.redirect("/register");
        } else if (result) {

            console.log("---------------REGISTER CORRECTO----------------");
            console.log("USUARIO " + result);
            request.session.currentUser = usuario.email;
            response.redirect("/Index");
        }
        else {
            response.status(200);
            response.setFlash("El email introducido ya está registrado");
            response.redirect("/register");
        }
    });
}

app.post("/register", multerFactory.single('imagen'),
    check("password").isStrongPassword().isLength({ min: 8, max: 16 }), //se comprueba si la contraseña es fuerte y si el tam es 8-16
    (request, response) => {

        const errors = validationResult(request); //solo habrá errores si el check comprueba que la passw no es valida
        if (!errors.isEmpty()) {
            response.status(200);
            response.setFlash("La contraseña debe tener un tamaño de entre 8 y 16 caracteres y"
                + " contener al menos una minúscula, una mayúscula, un dígito y un caracter especial");
            return response.redirect("/register");
        } else if (request.body.password != request.body.passwordConfirm) { //comprobacion de que las contraseñas son iguales
            response.status(200);
            response.setFlash("Las contraseñas no coinciden");
            response.redirect("/register");
        } else {//CONTRASEÑAS CORRECTAS

            let usuario = {
                nombre: request.body.nombre,
                email: request.body.email,
                passw: request.body.password,
                perfil: request.body.perfil,
                tecnico: (request.body.tecnico == undefined ? "0" : request.body.tecnico),
                nEmpleado: request.body.nEmpleado,
                fecha: moment().format("DD[/]MM[/]YYYY"),
                hora: moment().format("HH:mm:ss"),
                imagen: null
            };

            if (request.file) {
                usuario.imagen = request.file.buffer
            }

            if (usuario.tecnico != "0") {
                daoU.nEmpleadoUnico(request.body.nEmpleado, function (err, result) {
                    if(err){
                        console.log("--------------ERROR REGISTER-----------------");
                        response.status(500);
                        response.setFlash("Error interno de acceso a la base de datos");
                        response.redirect("/register");
                    } else if(!result) {
                        response.status(200);
                        response.setFlash("El nº de empleado introducido ya está registrado");
                        response.redirect("/register");
                    }else{
                        registrarUser(usuario,response,request);
                    }
                });
            }else{
                registrarUser(usuario,response,request);
            }
          
        }
    });


function middlewareAccess(request, response, next) {
    if (request.session.currentUser === undefined) {
        response.redirect("/login");
    } else {
        response.locals.userEmail = request.session.currentUser;
        response.locals.userName = request.session.currentUserName;
        response.locals.userProfile = request.session.currentUserProfile;
        response.locals.userId = request.session.currentUserId;
        response.locals.tecnico = request.session.currentUserTecnico;
        response.locals.fecha = request.session.currentUserFecha;
        response.locals.hora = request.session.currentUserHora;
        response.locals.password = request.session.currentUserPassword;
        next();
    }
}
app.use(middlewareAccess);


//manejador para la ruta /imagen
app.get("/imagen/:correo", middlewareAccess, function (request, response) {
    let correoUsuario = request.session.currentUser;
    daoU.getUserImageName(correoUsuario, function (err, imagen) {
        if (!err) {
            if (imagen) {
                response.end(imagen);
            } else {
                response.sendFile(__dirname + "/public/img/" + "noUser.png");
            }
        }
        else {
            console.log("error")
        }
    })

})

//manejador para la ruta /logout
app.get("/logout", middlewareAccess, function (request, response) {
    request.session.destroy();
    response.status(200);
    response.redirect("/login")
});


//Task form
app.post("/addAviso", middlewareAccess, function (request, response) {
    console.log("HACE EL POST ");
    let texto;
    if (request.body.texto == undefined) {
        texto = '';
    } else texto = request.body.texto;
    let fecha = moment().format("DD[/]MM[/]YYYY");
    //hay dos categorias, si es S o I será categor1 y si no categor, no pueden ser ambas a la vez
    let categoria;
    if (request.body.categor == undefined) {
        categoria = request.body.categor1;
    } else categoria = request.body.categor;

    let tipo = request.body.subtipo;
    let user = request.session.currentUserId;
    let comentarios = '';
    //Falla si no se le ponen etiquetas en el SQL.
    daoA.insertAviso(user, texto, fecha, categoria, tipo, comentarios, function (err, result) {
        if (err) {
            console.log("--------------ERROR INSERTANDO-----------------");
            console.log(err.message);
        } else if (result) {
            console.log("---------------INSERCCIÓN CORRECTA----------------");
            console.log(result);
            response.status(200);
            response.redirect("/index");
        } else {
            console.log("Error de inserción");
            console.log("-------------------------------")
        }
    });

});

app.post("/asignarTecnico", middlewareAccess, function (request, response) {
    let tecnico = request.body.tecnico;
    let aviso = request.body.idAviso;
    console.log(request);
    daoA.asignarTecnico(tecnico, aviso, function (err, result) {
        if (err) {
            console.log("--------------ERROR ASIGNANDO-----------------");
            console.log(err.message);
        } else if (result) {
            console.log("---------------ASIGNACIÓN CORRECTA----------------");
            response.status(200);
            response.redirect("/entrantes");
        }
    });
});

app.post("/borrarUser", middlewareAccess, function (request, response) {
    let idUser = request.body.idUser;
    daoU.eliminarUsuario(idUser, function (err, result) {
        if (err) {
            console.log("--------------ERROR ELIMINANDO USUARIO-----------------");
            console.log(err.message);
        } else if (result) {
            console.log("---------------ELIMINACIÓN USUARIO CORRECTA----------------");
            response.status(200);
            response.redirect("/usuarios");
        }
    });
});

app.post("/terminarAviso", middlewareAccess, function (request, response) {
    let aviso = request.body.idAviso;
    let idTecnico = request.session.currentUserId;
    let comentario = request.body.comentario;
    daoA.eliminarAviso(idTecnico, aviso, comentario, function (err, result) {
        if (err) {
            console.log("--------------ERROR TERMINANDO AVISO-----------------");
            console.log(err.message);
        } else if (result) {
            console.log("---------------AVISO TERMINADO CORRECTAMENTE----------------");
            response.status(200);
            response.redirect("/index");
        }
    });
});

app.post("/eliminarAviso", middlewareAccess, function (request, response) {
    let aviso = request.body.idAviso;
    let idTecnico = request.session.currentUserId;
    let entrantes = request.body.entrantes;
    let comentario = "Este aviso ha sido eliminado por el técnico " + request.session.currentUserName
        + " debido a: " + '"' + request.body.comentario + '"';

    daoA.eliminarAviso(idTecnico, aviso, comentario, function (err, result) {
        if (err) {
            console.log("--------------ERROR ELIMINANDO AVISO-----------------");
            console.log(err.message);
        } else if (result) {
            console.log("---------------AVISO ELIMINADO CORRECTAMENTE----------------");
            response.status(200);
            if (entrantes != undefined) {
                response.redirect("/entrantes");
            } else response.redirect("/index");
        }
    });
});

//manejador para la ruta /login
app.get("/", function (request, response) {
    //Si ya está logueado esto lleva a la vista principal, si no al login
    if (request.session.currentUser === undefined) {
        response.redirect("/login");
    } else {
        response.redirect("/index");
    }
});

// Arrancar el servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});
