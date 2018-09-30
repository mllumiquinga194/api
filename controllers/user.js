'use strict'

var fs = require('fs'); //importamos el modulo de File System
var path = require('path'); // nos permite acceder a rutas completas

// importar el modelo
var User = require('../models/user');
//para cargar las contraseñas encriptadas
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');


//req lo que va a recibir en la peticion y res lo que va a devolver
function getUsers(req, res) {

    var userId = req.params.id;

    if(!userId){
        //sacar todos los usuarios de la base de datos
        var find = User.find({}).sort('name');
    }else{
        //sacar un usuario nada mas.
        var find = User.find({
            _id: userId
        }).sort('name');
    }

    find.exec((err, users) => {
        if(err){
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!users){
                return res.status(404).send({
                    message: 'No hay usuarios...'
                });
            }else{
                return res.status(200).send({
                    users
                });
            }
        }
    });
}

function deleteUser(req, res) {
    var userId = req.params.id;

    User.findByIdAndRemove(userId, (err, userRemoved) => {
        if(err){
            return res.status(500).send({
                message: 'Error en el servidor'
            });
        }else{
            if(!userRemoved){
                return res.status(404).send({
                    message: 'No se ha borrado el usuario'
                });
            }else{
                return res.status(200).send({
                    user: userRemoved
                });
            }
        }
    });
}

function saveUsers(req, res) {

    var user = new User(); //ya tengo una instancia del modelo de usuario

    var params = req.body;//recoger los parametros que vienen en post desde el body


    console.log('Nombre', params.name);
    console.log('Apellido', params.surname);
    console.log('Email', params.email);
    console.log('Password', params.password);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'noneUser.png';

    //guartdar a la base de datos pero primero vamos a encriptar la contraseña

    if (params.password) {
        //encriptar contraseña. esos NULL son necesarios
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;

            if (user.name != null && user.surname != null && user.email != null) {
                //guardar usuario
                user.save((err, userStored) => {
                    if (err) {
                        return res.status(500).send({
                                message: 'Email ya registrado',
                                err
                        });
                    } else {
                        if (!userStored) {
                            return res.status(404).send({
                                message: 'No se ha registrado el usuario'
                            });
                        } else {
                            return res.status(200).send({ user: userStored });
                        }
                    }
                });
            } else {
                return res.status(200).send({
                    message: 'Rellenar todos los campos'
                }); // es algo asi como un error
            }
        });
    } else {
        return res.status(200).send({
            message: 'Introduce la contraseña'
        }); // es algo asi como un error. error 500 es como para una excepcion, 200 es mas suave, en este caso es solo para indicar que faltan datos. error 400 es cuando falta un registro o no existe en la base de datos
    }

}

function loginUser(req, res) {

    //con body-parser, los valores recibidos por post, automaticamente son convertidos a un objetos JSON
    var params = req.body;
    var email = params.email;
    var password = params.password;

    console.log('Email', email);
    console.log('Password', password);
    //tolowerCase para cconvertir todo a minusculas. el metodo findOne tiene un callback
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!user) {
                //si el usuario no existe
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            } else {
                //si entra aqui es porque el usuario existe
                //comprobar la contraseña, la que llega por post con la quetengo en la base de datos "user.password"
                bcrypt.compare(password, user.password, function (err, check) {
                    if (check) {
                        //devolver los datos del usuario logeados
                        if (params.gethash) {
                            //devolver un token de JWT
                            return res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            return res.status(200).send({ user });
                        }
                    } else {
                        return res.status(404).send({
                            message: 'El usuario no ha podido logearse'
                        });
                    }
                });
            }
        }
    });
}

function updatePass(req, res) {

    var userId = req.params.id;
    var params = req.body;

    var user = new User(); //ya tengo una instancia del modelo de usuario

    //guardar a la base de datos pero primero vamos a encriptar la contraseña

    if (params.password) {

        User.findById(userId, (err, user) => {
            if (err) {
                return res.status(500).send({ //error 500 porque es error de servidor
                    message: 'Error al buscar el usuario'
                });
            } else {
                if (!user) {
                    return res.status(404).send({
                        message: 'No se ha podido encontrar el usuario'
                    });
                } else {
                    //encriptar contraseña. esos NULL son necesarios
                    bcrypt.hash(params.password, null, null, function (err, hash) {
                        user.password = hash;
                    });
                    user.save((err, userStored) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error al guardar el usuario'
                            });
                        } else {
                            if (!userStored) {
                                return res.status(404).send({
                                    message: 'No se ha registrado el usuario'
                                });
                            } else {
                                return res.status(200).send({ user: userStored });
                            }
                        }
                    });
                }
            }
        });
    } else {
        return res.status(200).send({
            message: 'Introduce la contraseña'
        }); // es algo asi como un error. error 500 es como para una excepcion, 200 es mas suave, en este caso es solo para indicar que faltan datos. error 400 es cuando falta un registro o no existe en la base de datos
    }

}

//para comparar la pass ingresada con la actual antes de cambiar la pass! es como un metodo de seguridad
function comparePass(req, res) {

    var userId = req.params.id;
    var params = req.body;
    var password = params.password;

    // console.log('ID del usuario logeado que llega al servidor por url: ', userId);
    // console.log('parametros que vienen del servidor: ', params);

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({ //error 500 porque es error de servidor
                message: 'Error al buscar el usuario'
            });
        } else {
            if (!user) {
                return res.status(404).send({
                    message: 'No se ha podido encontrar el usuario'
                });
            } else {
                bcrypt.compare(password, user.password, function (err, check) {
                    if (check) {
                        return res.status(200).send({
                            user
                        });
                    } else {
                        return res.status(404).send({
                            message: 'Contraseña no coincide'
                        });
                    }
                });
            }
        }
    });
}


function updateUser(req, res) {

    var userId = req.params.id; //este ID lo sacare de la url.. se lo pasare por URL. 
    var update = req.body; //recogo el body, todos los datos que llegan del usuario que voy a actualizar

    // if (userId != req.user.sub) {
    //     return res.status(500).send({ //error 500 porque es error de servidor
    //         message: 'No tienes autorizacion para actualizar este usuario'
    //     });
    // }

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            return res.status(500).send({ //error 500 porque es error de servidor
                message: 'Error al actualizar el usuario'
            });
        } else {
            if (!userUpdated) {
                return res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            } else {
                return res.status(200).send({
                    user: userUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                });
            }
        }
    });
}


function uploadImage(req, res) {

    var userId = req.params.id; //recibimos el Id de la ULR
    var file_name = 'No subido...';

    if (req.files) {//tomo los archivos que vienen del body
        var file_path = req.files.image.path; // aqui ya tengo el path de la imagen, ahora recorto ese path para tener solo el nombre

        var file_split = file_path.split('\/'); //le recorto las barras a ese path y en file name guardo el arreglo que me queda.
        var file_name = file_split[2];

        //si quisiera guardar la extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_name);
        console.log(file_ext);


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'PNG' || file_ext == 'JPG' || file_ext == 'GIF' || file_ext == 'JPEG' || file_ext == 'jpeg') {
            User.findByIdAndUpdate(userId, { image: file_name }, (err, userUpdated) => {
                if (err) {
                    return res.status(500).send({ //error 500 porque es error de servidor
                        message: 'Error al actualizar el usuario'
                    });
                } else {
                    if (!userUpdated) {
                        return res.status(404).send({
                            message: 'No se ha podido actualizar el usuario'
                        });
                    } else {
                        if (userUpdated.image != 'noneUser.png') {

                            let imageOld = userUpdated.image;
                            var path_file = './uploads/users/' + imageOld;
                            fs.exists(path_file, function (exists) {
                                if (exists) {
                                    fs.unlink(path_file, (ready) => {
                                        if (ready) {
                                            return res.status(200).send({
                                                image: file_name, user: userUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                                            });
                                        }
                                    });
                                } else {
                                    console.error('no existe ');
                                }
                            });
                            return res.status(200).send({
                                image: file_name, user: userUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                            });
                        }
                        return res.status(200).send({
                            image: file_name, user: userUpdated //estos no son los datos nuevos, sino los datos que tenia antes de actualizar
                        });
                    }
                }
            });
        } else {
            return res.status(200).send({
                message: 'Ext del archivo no valida'
            });
        }

    } else {
        return res.status(200).send({
            message: 'No ha subido ninguna imagen'
        });
    }

}

function getImageFile(req, res) {

    var imageFile = req.params.imageFile; //recogo el parametro que me va a llegar por url. que sera el nombre del fichero que yo quiero sacar por la base de datos
    if (!imageFile) {
        imageFile = 'noneUser.png';
    }
    var path_file = './uploads/users/' + imageFile; //elegimos esta ruta porque el middleware necesita empezar desde la raiz del proyecto
    fs.exists(path_file, function (exists) {
        if (exists) {
            return res.sendFile(path.resolve(path_file));//con resolve armo el path donde easta la imagen
        } else {
            return res.status(200).send({
                message: 'No existe la imagen...'
            });
        }
    });

}


//para poder utilizar todos los metodos que hagamos en algun modulo, o sea, fuera
module.exports = {
    getUsers,
    comparePass,
    updatePass,
    deleteUser,
    saveUsers,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};