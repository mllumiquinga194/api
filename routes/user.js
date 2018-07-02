'use strict'

var express = require('express');
var UserController = require('../controllers/user');

// para poder crear rutas para nuestro api rest
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

// cargar modulo multiparty. ya nos permite tener un middleware para trabajar con la subida de ficheros necesario para cargar imagenes, precisamente en el campo de imagen. sunir una o actualizarla. en la 
var multipart = require('connect-multiparty');
//vamos a crear ese middleware y utilizarlo en la ruta
var md_upload = multipart({ uploadDir: './uploads/users' });// en este directorio se subira todo lo que suba el usuario. en este caso la imagen de avatar

// de esta forma se crean las rutas
api.get('/users/:id?', md_auth.ensureAuth, UserController.getUsers);
api.post('/comparePass/:id', md_auth.ensureAuth, UserController.comparePass);
api.post('/pass/:id', md_auth.ensureAuth, UserController.updatePass);
api.post('/register', UserController.saveUsers);
api.post('/login', UserController.loginUser);
api.delete('/user/:id', md_auth.ensureAuth, UserController.deleteUser);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser); //va a recibir un id obligatorio, si quisieramos que fuera opcional le pusieramos el '/update-user/:id?'
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile?', UserController.getImageFile);

// ahora exportamos nuestro api para poder utilizarlo fuera de nuestro fichero y que fuera pueda ser reconocido y las rutas sirvan en todo nuestro backend

module.exports = api;