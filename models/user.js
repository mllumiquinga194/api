'use strict'

var mongoose = require('mongoose'); //para la conexion a la base de datos
const uniqueValidator = require('mongoose-unique-validator');//para validar el correo, aunque puede hacerse con cualquier cosa

// para Schema de base de datos
//permite crear un opbjeto tipo schema.
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    email: {
      type: String,
      unique: true,
      required: [true, 'El email es necesario']
    },
    password : String,
    role : String,
    image: String
});

UserSchema.plugin(uniqueValidator, {//para validar lo del correo
  message: '{PATH} debe ser unico'
});

//para poder utilizar este modelo fuera de este fichero
module.exports = mongoose.model('User', UserSchema);

