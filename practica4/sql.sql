DROP TABLE `aw_tareas_etiquetas`, `aw_tareas_tareas`, `aw_tareas_tareas_etiquetas`, `aw_tareas_user_tarea`, `aw_tareas_usuarios`;

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

CREATE TABLE aw_tareas_usuarios (
    idUser INTEGER PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    img VARCHAR(100) 
);

CREATE TABLE aw_tareas_tareas (
    idTarea INTEGER PRIMARY KEY AUTO_INCREMENT,
    texto TEXT 
);

CREATE TABLE aw_tareas_etiquetas(
    idEtiqueta INTEGER PRIMARY KEY AUTO_INCREMENT,
    texto TEXT UNIQUE
);

CREATE TABLE aw_tareas_user_tarea (
    idTarea INTEGER REFERENCES aw_tareas_tareas  (idTarea) ,
    idUser VARCHAR(200) REFERENCES aw_tareas_usuarios (idUser) ,
    hecho INTEGER,
    PRIMARY KEY (idTarea,idUser)
);


CREATE TABLE aw_tareas_tareas_etiquetas (
    idTarea INTEGER REFERENCES aw_tareas_tareas  (idTarea),
    idEtiqueta INTEGER REFERENCES aw_tareas_etiquetas(idEtiqueta),
    PRIMARY KEY (idTarea,idEtiqueta)

);


INSERT INTO aw_tareas_usuarios(email, password, img)
VALUES('usuario@ucm.es', 'usuario', 'aitor.jpg');

INSERT INTO aw_tareas_tareas(texto)
VALUES('Preparar prácticas AW'), ('Mirar fechas de congreso'), ('Ir al Supermercado'), ('Jugar al Fútbol'),
('Hablar con el profesor');

INSERT INTO aw_tareas_user_tarea (idUser, idTarea, hecho)
VALUES (1, 1,0), (1,2,1), (1,3,0), (1,4,0) ;

INSERT INTO aw_tareas_etiquetas(texto)
VALUES ('Universidad'), ('AW'), ('TP'), ('Práctica'), ('Personal'), ('Académico'), ('Deporte'), ('Básico');

INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta)
VALUES (1,1), (1,2), (1,3), (2,6),(3,5), (3,6), (4,5), (4,7), (5,1), (5,3);