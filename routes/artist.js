'use strict'

var express = require('express');

var ArtistController = require('../controllers/artist');

// para poder crear rutas para nuestro api rest
var api = express.Router();

var md_auth = require('../middlewares/authenticated'); //para permitir acceso a usuarios primeramente logeados
// cargar modulo multiparty. ya nos permite tener un middleware para trabajar con la subida de ficheros necesario para cargar imagenes, precisamente en el campo de imagen. sunir una o actualizarla. en la 
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/artists' });// en este directorio se subira todo lo que suba el usuario. en este caso la imagen de avatar

api.get('/artist/:id', md_auth.ensureAuth, ArtistController.getArtist);
api.post('/artist', md_auth.ensureAuth, ArtistController.saveArtists); //para guardar artistas
api.get('/artists/:page?', md_auth.ensureAuth, ArtistController.getArtists); //para obtener los artistas de forma paginada
api.put('/artists/:id', md_auth.ensureAuth, ArtistController.updateArtist); // Para Actualizar
api.delete('/artists/:id', md_auth.ensureAuth, ArtistController.deleteArtist);
api.post('/upload-image-artist/:id', [md_auth.ensureAuth, md_upload], ArtistController.uploadImage);
api.get('/get-image-artist/:imageFile?', ArtistController.getImageFile);

// ahora exportamos nuestro api para poder utilizarlo fuera de nuestro fichero y que fuera pueda ser reconocido y las rutas sirvan en todo nuestro backend
module.exports = api;