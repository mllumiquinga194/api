'use strict'

var express = require('express');

var SongController = require('../controllers/song');

// para poder crear rutas para nuestro api rest
var api = express.Router();

var md_auth = require('../middlewares/authenticated'); //para permitir acceso a usuarios primeramente logeados
// cargar modulo multiparty. ya nos permite tener un middleware para trabajar con la subida de ficheros necesario para cargar imagenes, precisamente en el campo de imagen. subir una o actualizarla. en la base de datos
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/songs' });// en este directorio se subira todo lo que suba el usuario. en este caso la imagen de avatar

//CARGAR RUTAS

api.get('/song/:id', md_auth.ensureAuth, SongController.getSong);
api.post('/song', md_auth.ensureAuth, SongController.saveSong);
api.get('/songs/:album?', md_auth.ensureAuth, SongController.getSongs);
api.put('/song/:id', md_auth.ensureAuth, SongController.updateSong);
api.delete('/song/:id', md_auth.ensureAuth, SongController.deleteSong);
api.post('/upload-file-song/:id', [md_auth.ensureAuth, md_upload], SongController.uploadFile);
api.get('/get-song-file/:songFile', SongController.getSongFile);

// ahora exportamos nuestro api para poder utilizarlo fuera de nuestro fichero y que fuera pueda ser reconocido y las rutas sirvan en todo nuestro backend
module.exports = api;