'use strict'

var mongoose = require('mongoose'); //para la conexion a la base de datos

// para Schema de base de datos
//permite crear un opbjeto tipo schema.
var Schema = mongoose.Schema;

var ArtistSchema = Schema({
    name: String,
    description: String,
    image: String
});

//para poder utilizar este modelo fuera de este fichero
//para poder crear un modelo de artista utilizando el esquema de artista
module.exports = mongoose.model('Artist', ArtistSchema);
