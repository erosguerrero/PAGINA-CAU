    DROP TABLE `UCM_AW_CAU_USU_Usuarios`, `UCM_AW_CAU_AVI_Avisos`;
    CREATE TABLE UCM_AW_CAU_USU_Usuarios (
        idUser INTEGER PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(50) NOT NULL,
        nombre VARCHAR(50) NOT NULL,
        perfil VARCHAR(50) NOT NULL,
        tecnico INTEGER,
        nEmpleado VARCHAR(50),
        img blob,
        fecha VARCHAR(50) NOT NULL,
        hora VARCHAR(50) NOT NULL,
        activo INTEGER NOT NULL
    );

    CREATE TABLE  UCM_AW_CAU_AVI_Avisos (
        idAviso INTEGER PRIMARY KEY AUTO_INCREMENT,
        categoria VARCHAR(50) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        fecha VARCHAR(50) NOT NULL,
        user INTEGER NOT NULL,
        tecnico INTEGER,
        texto TEXT NOT NULL,
        comentarios TEXT,
        activo INTEGER NOT NULL
    );

    INSERT INTO UCM_AW_CAU_USU_Usuarios (email, password, nombre, perfil, tecnico, nEmpleado,fecha,hora,activo)
    VALUES('usuario@ucm.es', 'usuario', 'usuario', 'A', 0, '','12/10/2002','12:30:01',1),
    ('tecnico@ucm.es', 'tecnico', 'tecnico', 'PAS', 1, '1234-abc','13/10/2013','13:50:05',1),
    ('tecnico2@ucm.es', 'tecnico2', 'tecnico2', 'PAS', 1, '1234-fgh','15/05/2015','12:50:05',1),
    ('usuario2@ucm.es', 'usuario2', 'usuario2', 'A', 0, '','16/07/2002','19:30:07',1);

    INSERT INTO UCM_AW_CAU_AVI_Avisos (categoria, tipo, fecha, user, tecnico, texto, comentarios,activo)
    VALUES('S', 'Registro electrónico', '12/01/2022', 1 , 2, 'Cambiar el icono para acceder a la página del registro
    electrónico porque no se diferencia bien qué quiere decir y se puede confundir con un icono para logearse o
    hacer cualquier otra acción. Además si se pusiera en un color más llamativo se vería mejor.', '',1),
    ('I', 'Sede electrónica', '28/02/2022', 1 , 2, 'No funciona', '',1),
    ('F', 'Servicio de Cafetería', '09/12/2022', 4 , 3, 'Funciona muy bien', '',1),
    ('I', 'Correo electrónico ', '13/12/2022', 4 , 3, 'No me deja acceder a mi cuenta', '',0),
    ('I', 'Correo electrónico ', '13/12/2022', 4 ,"" , 'No me llegan los mensajes', '',1),
    ('I', 'Correo electrónico ', '13/12/2022', 4 ,"" , 'Quiero cambiar mi contraseña', '',1);

