'use strict'

var mongoose = require('mongoose'); //para la conexion a la base de datos

// para Schema de base de datos
//permite crear un opbjeto tipo schema.
var Schema = mongoose.Schema;

var AlbumSchema = Schema({
    title: String,
    description: String,
    year: Number,
    image: String,
    artist: { //va a guardar un ID de un objeto o un documento de la base de datos y ese objeto va a ser de tipo Artist
        type : Schema.ObjectId,
        ref: 'Artist' //el va a reconocer que es de artis y relacionara un objeto con otro
    }
});

//para poder utilizar este modelo fuera de este fichero
//para poder crear un modelo de artista utilizando el esquema de artista
module.exports = mongoose.model('Album', AlbumSchema);
