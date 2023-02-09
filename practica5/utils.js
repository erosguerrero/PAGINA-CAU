"use strict"
class utils {
    constructor() {
        
    }
    //devolver las no finalizadas
    getToDoTasks(listaTareas){
        let filter = listaTareas.filter(function(tarea){
            return !tarea.done;
             /*las que no tienen done también nos las quedamos porque estamos
             guardando todo lo que no sea true, es decir tanto como false como null,
             es decir que funciona como si done estuviera a false  */
        })

        let result = filter.map(function(tarea){
            return tarea.text;

        })
        return result;
    }

    //que contegan la etiqueta pasada por segundo paametro
    findByTag(listaTareas, tag){
        let filtered =  listaTareas.filter(function(tarea){
            return tarea.tags.some(function(thistag){
                return thistag === tag;
            })
        })

        let result = filtered.map(function(tarea){
                return {text : tarea.text, tags : tarea.tags}
        })
        return result;
    }


//tasks que contengan al
//menos una etiqueta que coincida con una de las del array tags pasado como segundo parámetro
    findByTags(listaTareas, etiquetas){
        let filtered =  listaTareas.filter(function(tarea){ //Nos quedamos con aquellas tareas tal que
            return etiquetas.some(function(etiqueta){ //Para alguna de las etiquetas de entrada
                    return tarea.tags.some(function(tag){//Tienen un tag tal que
                        return tag === etiqueta; //ambas coinciden
                    })
            });
            
        })

            return filtered;
    }

    countDone(listaTareas){
        return listaTareas.filter(function(tarea){
            return tarea.done;
        }).length;
    }

    createTask(texto){
        let textNoSpaces = texto.split(" "); //El texto dividido por espacios


        let text = textNoSpaces.filter(function(etiqueta){
            return etiqueta.charAt() !== "@"; //Aquellas palabras que no son etiquetas, forman el atributo text
        })
        //Transformamos las etiquetas en palabras normales y las guardamos
        let etiquetas = textNoSpaces.filter(function(etiqueta){
            return etiqueta.charAt() === "@"; //Si se deja charAt sin indice, se da por hecho que es 0
        }).map(function(etiqueta){ //A lo que devuelva el filtro, le aplicamos una transformacion
            return etiqueta.replace("@",""); //limpiamos las @
        })

        return { text: text.join(" "), tags: etiquetas, done: false };
    }
}

module.exports = utils;
    /*
    
let listaTareas = [
    {text:"Preparar prácticas AW", tags:["universidad","awt"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
    ];

console.log("----------------------------------------")
console.log("getToDoTasks (listaTareas) =");
console.log(getToDoTasks(listaTareas));
console.log("----------------------------------------")

console.log(" \n findByTag(listaTareas,'personal') =");
console.log(findByTag(listaTareas,"personal"));
console.log("----------------------------------------")

console.log(" \n findByTags(listaTareas, ['personal', 'practica']) =");
console.log(findByTags(listaTareas, ["personal", "practica"]));
console.log("----------------------------------------")

console.log(" \n countDone(listaTareas) =");
console.log(countDone(listaTareas));
console.log("----------------------------------------")

console.log(" \n createTask('Ir al medico @personal @salud') = ");
console.log(createTask("Ir al medico @personal @salud"));
console.log("----------------------------------------")
*/