'use strict'

var express = require('express');

var AlbumController = require('../controllers/album');

// para poder crear rutas para nuestro api rest
var api = express.Router();

var md_auth = require('../middlewares/authenticated'); //para permitir acceso a usuarios primeramente logeados
// cargar modulo multiparty. ya nos permite tener un middleware para trabajar con la subida de ficheros necesario para cargar imagenes, precisamente en el campo de imagen. subir una o actualizarla. en la base de datos
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/albums' });// en este directorio se subira todo lo que suba el usuario. en este caso la imagen de avatar

//CARGAR RUTAS

api.get('/album/:id', md_auth.ensureAuth, AlbumController.getAlbum);
api.post('/album', md_auth.ensureAuth, AlbumController.saveAlbum);
api.get('/albums/:artist?', md_auth.ensureAuth, AlbumController.getAlbums);
api.put('/album/:id', md_auth.ensureAuth, AlbumController.updateAlbum);
api.delete('/album/:id', md_auth.ensureAuth, AlbumController.deleteAlbum);
api.post('/upload-image-album/:id', [md_auth.ensureAuth, md_upload], AlbumController.uploadImage);
api.get('/get-image-album/:imageFile?', AlbumController.getImageFile);

// ahora exportamos nuestro api para poder utilizarlo fuera de nuestro fichero y que fuera pueda ser reconocido y las rutas sirvan en todo nuestro backend
module.exports = api;