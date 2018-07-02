'use strict'

var mongoose = require('mongoose'); //para la conexion a la base de datos

// para Schema de base de datos
//permite crear un opbjeto tipo schema.
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password : String,
    role : String,
    image: String
});

//para poder utilizar este modelo fuera de este fichero
module.exports = mongoose.model('User', UserSchema);

