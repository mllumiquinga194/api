'use strict'

var mongoose = require('mongoose'); //para la conexion a la base de datos

// para Schema de base de datos
//permite crear un opbjeto tipo schema.
var Schema = mongoose.Schema;

var SongSchema = Schema({
    number: String,
    name: String,
    duration: String,
    file: String,
    album: { //va a guardar un ID de un objeto o un documento de la base de datos y ese objeto va a ser de tipo Artist
        type : Schema.ObjectId, ref: 'Album' //el va a reconocer que es de artis y relacionara un objeto con otro
    }
});

//para poder utilizar este modelo fuera de este fichero
//para poder crear un modelo de artista utilizando el esquema de Song
module.exports = mongoose.model('Song', SongSchema);
